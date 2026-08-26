import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.entities import Proposal, Report, IndustryOffer, User, HEI, Notification, AuditLog
from app.schemas.dtos import IndustryOfferCreate, IndustryOfferOut, ProposalOut
from app.auth.dependencies import get_current_user, require_roles
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/industry", tags=["Industry Portal"])

@router.get("/solutions")
def browse_solutions(
    domain: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Industry partners browse problem-solution pairs with active HEI proposals.
    """
    query = db.query(Proposal).join(Report).join(HEI)

    if domain and domain != "All":
        query = query.filter(Report.domain == domain)
    if district and district != "All":
        query = query.filter(Report.district == district)
    if status_filter and status_filter != "All":
        query = query.filter(Proposal.status == status_filter)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Proposal.solution_title.ilike(s),
                Proposal.solution_description.ilike(s),
                Report.title.ilike(s),
                HEI.institute_name.ilike(s)
            )
        )

    proposals = query.order_by(Proposal.created_at.desc()).all()

    # Format enriched response
    results = []
    for prop in proposals:
        report = prop.report
        hei = prop.hei
        offers = db.query(IndustryOffer).filter(IndustryOffer.proposal_id == prop.id).all()
        results.append({
            "id": prop.id,
            "solution_title": prop.solution_title,
            "solution_description": prop.solution_description,
            "methodology": prop.methodology,
            "estimated_budget_inr": prop.estimated_budget_inr,
            "estimated_duration_months": prop.estimated_duration_months,
            "deliverables": prop.deliverables,
            "status": prop.status,
            "created_at": prop.created_at.isoformat(),
            "lead_faculty_name": prop.lead_faculty_name,
            "lead_faculty_email": prop.lead_faculty_email,
            "team_members": prop.team_members,
            "report": {
                "id": report.id,
                "tracking_number": report.tracking_number,
                "title": report.title,
                "description": report.description,
                "domain": report.domain,
                "category": report.category,
                "priority": report.priority,
                "district": report.district,
                "latitude": report.latitude,
                "longitude": report.longitude,
                "ai_summary": report.ai_summary,
                "is_ai_simulated": report.is_ai_simulated,
                "media_urls": report.media_urls
            },
            "hei": {
                "id": hei.id,
                "institute_name": hei.institute_name,
                "district": hei.district,
                "aishe_code": hei.aishe_code,
                "specializations": hei.specializations
            },
            "offers_count": len(offers),
            "funded_amount_total": sum(o.funding_amount_inr for o in offers if o.status == "Accepted")
        })

    return results


@router.post("/offers", response_model=IndustryOfferOut, status_code=status.HTTP_201_CREATED)
def submit_industry_offer(
    offer_in: IndustryOfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["industry_partner", "govt_admin"]))
):
    """
    Industry partner commits CSR grant, R&D funding, or technical mentorship.
    """
    proposal = db.query(Proposal).filter(Proposal.id == offer_in.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Target proposal not found.")

    report = proposal.report
    company_name = current_user.organization or current_user.full_name

    offer = IndustryOffer(
        proposal_id=proposal.id,
        report_id=report.id,
        industry_user_id=current_user.id,
        company_name=company_name,
        offer_type=offer_in.offer_type,
        funding_amount_inr=offer_in.funding_amount_inr,
        mentorship_scope=offer_in.mentorship_scope,
        message=offer_in.message,
        contact_person=offer_in.contact_person,
        contact_email=offer_in.contact_email,
        status="Offered"
    )
    db.add(offer)

    # Update status
    report.status = "Industry_Offered"
    proposal.status = "Industry_Funded" if offer_in.funding_amount_inr > 0 else "Under_Review"

    # Notification to HEI team
    hei = proposal.hei
    if hei and hei.user_id:
        hei_notif = Notification(
            user_id=hei.user_id,
            role_target="hei_reviewer",
            title=f"New Industry Offer: {company_name}",
            message=f"{company_name} submitted an offer ({offer_in.offer_type} of ₹{offer_in.funding_amount_inr:,.0f}) for '{proposal.solution_title[:35]}...'.",
            link="/hei"
        )
        db.add(hei_notif)

    # Notification to Govt
    govt_notif = Notification(
        role_target="govt_admin",
        title="CSR / Industry Partnership Committed",
        message=f"{company_name} offered support for proposal #{proposal.id} ({report.domain} in {report.district}).",
        link="/govt"
    )
    db.add(govt_notif)

    # Audit log
    audit = AuditLog(
        report_id=report.id,
        action="INDUSTRY_OFFER_SUBMITTED",
        actor_name=company_name,
        actor_role="industry_partner",
        details={
            "offer_type": offer_in.offer_type,
            "funding_inr": offer_in.funding_amount_inr,
            "proposal_id": proposal.id
        }
    )
    db.add(audit)

    db.commit()
    db.refresh(offer)
    return offer


@router.get("/my-offers", response_model=List[IndustryOfferOut])
def get_my_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["industry_partner", "govt_admin"]))
):
    if current_user.role == "industry_partner":
        return db.query(IndustryOffer).filter(IndustryOffer.industry_user_id == current_user.id).order_by(IndustryOffer.created_at.desc()).all()
    return db.query(IndustryOffer).order_by(IndustryOffer.created_at.desc()).all()
