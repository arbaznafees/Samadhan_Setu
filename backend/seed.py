import logging
import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db, engine
from app.models.entities import User, HEI, Report, Proposal, IndustryOffer, Notification, AuditLog
from app.auth.security import get_password_hash
from app.services.gemini_service import get_text_embedding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

def seed_database():
    logger.info("Initializing tables before seeding...")
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            logger.info("Database already seeded. Skipping initial seeding.")
            return

        logger.info("--- Seeding Demo Users ---")
        demo_password = get_password_hash("password123")

        # 1. Citizen User
        user_citizen = User(
            email="citizen@samadhansetu.jh.gov.in",
            hashed_password=demo_password,
            full_name="Ramesh Kumar Mahto",
            phone="+91 94311 82910",
            role="citizen",
            district="Ranchi",
            organization=None
        )
        db.add(user_citizen)

        # 2. HEI Reviewer (BIT Mesra)
        user_hei = User(
            email="bit.mesra@samadhansetu.jh.gov.in",
            hashed_password=demo_password,
            full_name="Dr. Alok Verma",
            phone="+91 651 2275444",
            role="hei_reviewer",
            district="Ranchi",
            organization="Birla Institute of Technology, Mesra"
        )
        db.add(user_hei)

        # 3. Industry Partner (Tata Steel CSR)
        user_industry = User(
            email="csr@tatasteel.com",
            hashed_password=demo_password,
            full_name="Ananya Sen (CSR Lead)",
            phone="+91 657 6644000",
            role="industry_partner",
            district="East Singhbhum",
            organization="Tata Steel Foundation"
        )
        db.add(user_industry)

        # 4. Govt Admin
        user_govt = User(
            email="admin@jharkhand.gov.in",
            hashed_password=demo_password,
            full_name="Sanjay K. Murmu (IAS)",
            phone="+91 651 2400240",
            role="govt_admin",
            district="Ranchi",
            organization="Dept. of Higher, Technical Education & Skill Development"
        )
        db.add(user_govt)
        db.commit()
        
        db.refresh(user_citizen)
        db.refresh(user_hei)
        db.refresh(user_industry)
        db.refresh(user_govt)

        logger.info("--- Seeding Higher Education Institutions (HEIs) ---")
        heis_data = [
            {
                "user_id": user_hei.id,
                "institute_name": "Birla Institute of Technology (BIT) Mesra",
                "aishe_code": "U-0205",
                "district": "Ranchi",
                "latitude": 23.4123,
                "longitude": 85.4399,
                "specializations": ["Water Resources", "Rural Engineering", "IoT & Sensor Networks", "Renewable Energy", "Environmental Geotechnology"],
                "contact_email": "dean.rnd@bitmesra.ac.in",
                "contact_phone": "+91 651 2275444"
            },
            {
                "user_id": None,
                "institute_name": "Indian Institute of Technology (IIT ISM) Dhanbad",
                "aishe_code": "U-0208",
                "district": "Dhanbad",
                "latitude": 23.8144,
                "longitude": 86.4412,
                "specializations": ["Mining Safety", "Environmental Engineering", "Groundwater Hydrology", "Clean Energy", "Geotechnical Engineering"],
                "contact_email": "rnd@iitism.ac.in",
                "contact_phone": "+91 326 2235001"
            },
            {
                "user_id": None,
                "institute_name": "National Institute of Technology (NIT) Jamshedpur",
                "aishe_code": "U-0207",
                "district": "East Singhbhum",
                "latitude": 22.7770,
                "longitude": 86.1441,
                "specializations": ["Structural Engineering", "Metallurgical Solutions", "Smart Grid", "Manufacturing Tech", "Water Treatment"],
                "contact_email": "dean.fw@nitjsr.ac.in",
                "contact_phone": "+91 657 2373407"
            },
            {
                "user_id": None,
                "institute_name": "Birsa Agricultural University (BAU)",
                "aishe_code": "U-0204",
                "district": "Ranchi",
                "latitude": 23.4431,
                "longitude": 85.3184,
                "specializations": ["Agriculture", "Micro-Irrigation", "Crop Disease Diagnostics", "Soil Salinity", "Agroforestry"],
                "contact_email": "drbau@baujharkhand.org",
                "contact_phone": "+91 651 2450500"
            },
            {
                "user_id": None,
                "institute_name": "All India Institute of Medical Sciences (AIIMS) Deoghar",
                "aishe_code": "U-0992",
                "district": "Deoghar",
                "latitude": 24.4920,
                "longitude": 86.6900,
                "specializations": ["Healthcare", "Telemedicine", "Rural Epidemiology", "Maternal Health", "Nutritional Research"],
                "contact_email": "research@aiimsdeoghar.edu.in",
                "contact_phone": "+91 6432 291100"
            },
            {
                "user_id": None,
                "institute_name": "Kolhan University",
                "aishe_code": "U-0210",
                "district": "West Singhbhum",
                "latitude": 22.5630,
                "longitude": 85.8070,
                "specializations": ["Tribal Livelihood", "Education", "Forest Products", "Community Development"],
                "contact_email": "vc@kolhanuniversity.ac.in",
                "contact_phone": "+91 6582 255274"
            }
        ]

        created_heis = []
        for h in heis_data:
            hei_obj = HEI(
                user_id=h["user_id"],
                institute_name=h["institute_name"],
                aishe_code=h["aishe_code"],
                district=h["district"],
                latitude=h["latitude"],
                longitude=h["longitude"],
                specializations=h["specializations"],
                contact_email=h["contact_email"],
                contact_phone=h["contact_phone"],
                active_projects_count=0
            )
            db.add(hei_obj)
            created_heis.append(hei_obj)
        
        db.commit()
        for h in created_heis:
            db.refresh(h)

        bit_mesra = created_heis[0]
        iit_dhanbad = created_heis[1]
        nit_jsr = created_heis[2]
        bau_ranchi = created_heis[3]

        logger.info("--- Seeding Realistic Citizen Grievance Reports ---")
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        
        # Report 1: Arsenic & Fluoride in Ormanjhi
        r1_title = "Severe Fluoride Contamination in Ormanjhi Block Handpumps"
        r1_desc = "Over 12 handpumps in Chakla village, Ormanjhi are yielding water with yellow discoloration and high fluoride content causing fluorosis among children."
        r1_emb = get_text_embedding(f"{r1_title} {r1_desc}")
        
        report_1 = Report(
            tracking_number="JH-2026-4192",
            citizen_id=user_citizen.id,
            citizen_name="Ramesh Kumar Mahto",
            citizen_phone="+91 94311 82910",
            title=r1_title,
            description=r1_desc,
            raw_text=f"{r1_title}\n{r1_desc}",
            language="English",
            domain="Water & Sanitation",
            category="Drinking Water Contamination",
            priority="Critical",
            status="Proposal_Submitted",
            latitude=23.4760,
            longitude=85.4980,
            address="Village Chakla, Block Ormanjhi",
            district="Ranchi",
            media_urls=["https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80"],
            embedding=r1_emb,
            ai_summary="High fluoride water contamination affecting over 350 households in Ormanjhi. Requires low-cost adsorbent filtration unit and community filter bank.",
            is_ai_simulated=True,
            is_duplicate=False,
            assigned_hei_id=bit_mesra.id,
            hei_match_score=95.0,
            hei_match_reasons=[
                "Matching Specializations: Water Resources, Environmental Geotechnology (+60%)",
                "District Proximity: Institution located in Ranchi (+25%)",
                "Optimal R&D Capacity: High research bandwidth (+15%)"
            ],
            created_at=now_utc - datetime.timedelta(days=4)
        )
        db.add(report_1)

        # Report 2: Jharia Coal Belt Subsurface Subsidence & Dust
        r2_title = "Subsurface Smoke & Road Cracks near Lodna Colliery"
        r2_desc = "Underground coal seam fire has caused visible cracks on the main connecting road and heavy toxic particulate emissions in Lodna settlement."
        r2_emb = get_text_embedding(f"{r2_title} {r2_desc}")
        
        report_2 = Report(
            tracking_number="JH-2026-8821",
            citizen_id=None,
            citizen_name="Sunil Bauri",
            citizen_phone="+91 98351 00214",
            title=r2_title,
            description=r2_desc,
            raw_text=f"{r2_title}\n{r2_desc}",
            language="English",
            domain="Environment & Forest",
            category="Mining Safety & Air Quality",
            priority="High",
            status="HEI_Assigned",
            latitude=23.7380,
            longitude=86.4170,
            address="Lodna Colony, Jharia",
            district="Dhanbad",
            media_urls=["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80"],
            embedding=r2_emb,
            ai_summary="Subsurface fire induced road subsidence and hazardous smoke emissions endangering 80+ families in Lodna.",
            is_ai_simulated=True,
            is_duplicate=False,
            assigned_hei_id=iit_dhanbad.id,
            hei_match_score=98.0,
            hei_match_reasons=[
                "Matching Specializations: Mining Safety, Environmental Engineering (+60%)",
                "District Proximity: Institution located in Dhanbad (+25%)",
                "Optimal R&D Capacity: Dedicated Mining Tech Wing (+15%)"
            ],
            created_at=now_utc - datetime.timedelta(days=2)
        )
        db.add(report_2)

        # Report 3: Vegetable Crop Wilt in Kanke Block
        r3_title = "Bacterial Wilt Outbreak in Tomato & Brinjal Fields in Kanke"
        r3_desc = "Over 40 acres of standing tomato crops showing sudden wilting and root browning. Local pesticides are completely ineffective."
        r3_emb = get_text_embedding(f"{r3_title} {r3_desc}")
        
        report_3 = Report(
            tracking_number="JH-2026-3019",
            citizen_id=None,
            citizen_name="Binod Gope",
            citizen_phone="+91 91223 44091",
            title=r3_title,
            description=r3_desc,
            raw_text=f"{r3_title}\n{r3_desc}",
            language="Hindi",
            domain="Agriculture & Irrigation",
            category="Crop Disease Diagnostics",
            priority="High",
            status="Proposal_Submitted",
            latitude=23.4350,
            longitude=85.3210,
            address="Kanke Block Agricultural Cluster",
            district="Ranchi",
            media_urls=["https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=600&q=80"],
            embedding=r3_emb,
            ai_summary="Ralstonia bacterial wilt outbreak impacting smallholder vegetable farmers. Immediate bio-agent soil treatment and pathogen isolation advised.",
            is_ai_simulated=True,
            is_duplicate=False,
            assigned_hei_id=bau_ranchi.id,
            hei_match_score=96.0,
            hei_match_reasons=[
                "Matching Specializations: Crop Disease Diagnostics, Agriculture (+60%)",
                "District Proximity: Located in Ranchi (+25%)",
                "Optimal R&D Capacity: Agro-Pathology Lab (+15%)"
            ],
            created_at=now_utc - datetime.timedelta(days=5)
        )
        db.add(report_3)

        # Report 4: Duplicate demo report of Report 1
        r4_title = "Contaminated yellow drinking water in Ormanjhi handpump"
        r4_desc = "Handpump near Chakla school is giving yellow water and kids are having joint pain from fluoride."
        r4_emb = get_text_embedding(f"{r4_title} {r4_desc}")
        
        report_4 = Report(
            tracking_number="JH-2026-9904",
            citizen_id=None,
            citizen_name="Anita Devi",
            citizen_phone="+91 97711 55601",
            title=r4_title,
            description=r4_desc,
            raw_text=f"{r4_title}\n{r4_desc}",
            language="English",
            domain="Water & Sanitation",
            category="Drinking Water Contamination",
            priority="High",
            status="HEI_Assigned",
            latitude=23.4765,
            longitude=85.4985,
            address="Chakla School Tola, Ormanjhi",
            district="Ranchi",
            media_urls=[],
            embedding=r4_emb,
            ai_summary="Suspected duplicate report of Ormanjhi fluoride issue.",
            is_ai_simulated=True,
            is_duplicate=True,
            duplicate_of_id=None,
            duplicate_similarity=0.894,
            assigned_hei_id=bit_mesra.id,
            hei_match_score=92.0,
            hei_match_reasons=["Matching Specializations: Water Resources (+60%)", "District Match (+25%)"],
            created_at=now_utc - datetime.timedelta(days=1)
        )
        db.add(report_4)

        db.commit()
        db.refresh(report_1)
        db.refresh(report_2)
        db.refresh(report_3)
        db.refresh(report_4)
        
        # Link duplicate correctly using actual committed ID
        report_4.duplicate_of_id = report_1.id
        db.commit()

        # Update HEI active projects counts
        bit_mesra.active_projects_count = 2
        iit_dhanbad.active_projects_count = 1
        bau_ranchi.active_projects_count = 1
        db.commit()

        logger.info("--- Seeding Proposals & Industry Offers ---")
        
        # Proposal for Report 1 by BIT Mesra
        prop_1 = Proposal(
            report_id=report_1.id,
            hei_id=bit_mesra.id,
            lead_faculty_name="Dr. Alok Verma",
            lead_faculty_email="alok.verma@bitmesra.ac.in",
            team_members=[
                {"name": "Dr. Alok Verma", "role": "Principal Investigator", "dept": "Environmental Engineering"},
                {"name": "Prof. S. Sen", "role": "Co-Investigator", "dept": "Chemical Engineering"},
                {"name": "Pooja Kumari", "role": "M.Tech Research Fellow", "dept": "Water Technology"},
                {"name": "Rahul Tirkey", "role": "B.Tech Student Lead", "dept": "Civil Engineering"}
            ],
            solution_title="Activated Alumina & Moringa Seed Community Bio-Adsorption Filter",
            solution_description="Deployment of a low-cost, gravity-fed filtration unit using activated alumina and indigenous moringa oleifera seed coagulants to reduce fluoride levels below WHO standard (1.0 mg/L). Includes IoT sensor for continuous TDS/Fluoride monitoring.",
            methodology="Phase 1: Water sample spectro-photometric testing across 12 borewells. Phase 2: Fabrication of 500 L/hr community pilot filter. Phase 3: Community training of Jal Sahiyas.",
            estimated_budget_inr=350000.0,
            estimated_duration_months=4,
            deliverables="1 Pilot Water Filter Station, 2 IoT Water Quality Nodes, Jal Sahiya User Manual, Water Safety Certification",
            status="Industry_Funded"
        )
        db.add(prop_1)
        db.commit()
        db.refresh(prop_1)

        # Industry Offer for Proposal 1 from Tata Steel CSR
        offer_1 = IndustryOffer(
            proposal_id=prop_1.id,
            report_id=report_1.id,
            industry_user_id=user_industry.id,
            company_name="Tata Steel Foundation",
            offer_type="CSR_Grant",
            funding_amount_inr=350000.0,
            mentorship_scope="CSR engineering support for structural skid mounting and village water distribution pipeline tie-in.",
            message="Tata Steel Foundation is pleased to sponsor the full capital expenditure for the Ormanjhi Water Purifier R&D project under our Swachh Jal Mission.",
            contact_person="Ananya Sen",
            contact_email="ananya.sen@tatasteel.com",
            status="Accepted"
        )
        db.add(offer_1)

        # Proposal for Report 3 by BAU
        prop_2 = Proposal(
            report_id=report_3.id,
            hei_id=bau_ranchi.id,
            lead_faculty_name="Dr. Pratibha Minz",
            lead_faculty_email="pratibha.minz@baujharkhand.org",
            team_members=[
                {"name": "Dr. Pratibha Minz", "role": "Lead Entomologist & Plant Pathologist", "dept": "Agriculture"},
                {"name": "Kishore Kumar", "role": "Field Extension Specialist", "dept": "Horticulture"}
            ],
            solution_title="Trichoderma & Pseudomonas Bio-Consortium Soil Drenching System",
            solution_description="Formulation of indigenous antagonistic bio-control agents to arrest bacterial wilt spreading in solanaceous vegetables and restore soil microbiome.",
            methodology="Lab culturing of virulent antagonist strains, field trial in 5 acre demo plot in Kanke, farmer distribution kit.",
            estimated_budget_inr=180000.0,
            estimated_duration_months=3,
            deliverables="500 Liters Bio-formulation, Farmer training workshop, Soil Health Report",
            status="Submitted"
        )
        db.add(prop_2)

        # Sample Notifications
        db.add(Notification(
            user_id=user_citizen.id,
            role_target="citizen",
            title="Solution Funded by Tata Steel Foundation!",
            message="Your report JH-2026-4192 (Fluoride Contamination) has been awarded a ₹3,50,000 CSR Grant for BIT Mesra's water filtration project.",
            link="/citizen?track=JH-2026-4192",
            is_read=False
        ))

        db.add(Notification(
            user_id=user_hei.id,
            role_target="hei_reviewer",
            title="CSR Grant Approved",
            message="Tata Steel Foundation has pledged ₹3,50,000 for your Ormanjhi Water Purifier proposal.",
            link="/hei",
            is_read=False
        ))

        db.commit()
        logger.info("--- Seeding Completed Successfully! ---")

    except Exception as e:
        logger.error(f"Error during database seed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()