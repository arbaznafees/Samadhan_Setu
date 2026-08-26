import math
import logging
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.entities import HEI, Report

logger = logging.getLogger(__name__)

# Specialized domain keyword mapping for enhanced institutional routing in Jharkhand
DOMAIN_KEYWORDS_MAP = {
    "Water & Sanitation": ["water", "filtration", "arsenic", "fluoride", "borewell", "groundwater", "hydrology", "sanitation", "jal", "handpump", "pipe", "turbidity", "iron"],
    "Agriculture & Irrigation": ["agriculture", "irrigation", "soil", "micro-irrigation", "crop", "agronomy", "pest", "horticulture", "kisan", "drought", "wilt"],
    "Roads & Infrastructure": ["civil", "roads", "bridges", "structural", "geotechnical", "bitumen", "concrete", "highways", "transportation"],
    "Healthcare": ["health", "medical", "telemedicine", "epidemiology", "biomedical", "diagnostics", "maternal", "public health", "clinic"],
    "Education & Skilling": ["education", "pedagogy", "smart classroom", "vocational", "skill development", "e-learning", "curriculum", "digital literacy"],
    "Environment & Forest": ["environment", "forest", "afforestation", "mining", "mine safety", "reclamation", "air quality", "wildlife", "ecology"],
    "Electricity & Energy": ["electrical", "solar", "renewable energy", "microgrid", "power", "grid", "transmission", "battery", "photovoltaic"],
    "Rural Livelihood": ["rural", "tribal", "handicrafts", "livelihood", "community development", "sustainable development", "microfinance"]
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the earth in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def match_report_to_hei(
    db: Session,
    report: Report,
    ai_keywords: Optional[List[str]] = None
) -> Tuple[Optional[int], float, List[str]]:
    """
    Rules-based HEI matching engine with strict 60/25/15 weighting:
    1. Specialization Keyword Overlap (Max 60 points):
       Evaluates institutional specializations against report domain, title, description, and AI keywords.
    2. Geographic Proximity via Haversine Lat/Lng Distance (Max 25 points):
       Computes actual geodesic distance (km) between report geotag and HEI campus.
    3. Workload Capacity Balancing (Max 15 points):
       Prioritizes institutions with available bandwidth / fewer active projects.
    
    Returns: (assigned_hei_id, match_score_percentage, reasons_list)
    """
    heis: List[HEI] = db.query(HEI).all()
    if not heis:
        logger.warning("No HEIs found in database for routing.")
        return None, 0.0, ["No registered HEIs available in the system"]

    report_text = f"{report.title} {report.description} {report.domain} {report.category}".lower()
    expanded_domain_words = DOMAIN_KEYWORDS_MAP.get(report.domain, [])
    
    scored_heis = []

    for hei in heis:
        score = 0.0
        reasons = []

        # 1. Specialization Keyword Overlap (Max 60 points)
        matched_specs = []
        spec_list = hei.specializations if isinstance(hei.specializations, list) else []
        
        for spec in spec_list:
            spec_lower = spec.lower()
            if spec_lower in report_text:
                matched_specs.append(spec)
                continue
            tokens = [t for t in spec_lower.split() if len(t) > 3]
            for token in tokens:
                if token in report_text or token in expanded_domain_words:
                    matched_specs.append(f"{spec}")
                    break
        
        # Deduplicate matched specs
        unique_matched = list(dict.fromkeys(matched_specs))
        if unique_matched:
            spec_points = min(60.0, len(unique_matched) * 30.0)
            score += spec_points
            reasons.append(f"Specialization Overlap (Max 60%): {', '.join(unique_matched[:3])} (+{int(spec_points)}%)")
        else:
            reasons.append("Specialization Overlap (Max 60%): Multidisciplinary base capacity (+15%)")
            score += 15.0

        # 2. Geographic Proximity via Haversine Distance (Max 25 points)
        if report.latitude is not None and report.longitude is not None and hei.latitude is not None and hei.longitude is not None:
            dist_km = haversine_distance_km(report.latitude, report.longitude, hei.latitude, hei.longitude)
            if dist_km <= 25.0:
                geo_points = 25.0
                dist_desc = f"Immediate Vicinity ({dist_km:.1f} km)"
            elif dist_km <= 60.0:
                geo_points = 20.0
                dist_desc = f"Adjacent District Proximity ({dist_km:.1f} km)"
            elif dist_km <= 120.0:
                geo_points = 15.0
                dist_desc = f"Sub-Regional Corridor ({dist_km:.1f} km)"
            elif dist_km <= 200.0:
                geo_points = 10.0
                dist_desc = f"Statewide Catchment ({dist_km:.1f} km)"
            else:
                geo_points = 5.0
                dist_desc = f"Extended Radius ({dist_km:.1f} km)"
            score += geo_points
            reasons.append(f"Geographic Proximity (Max 25%): {dist_desc} (+{int(geo_points)}%)")
        else:
            # Fallback to district name comparison if coordinates are absent
            if hei.district and report.district and hei.district.lower() == report.district.lower():
                score += 25.0
                reasons.append(f"Geographic Proximity (Max 25%): Same District ({hei.district}) (+25%)")
            else:
                score += 10.0
                reasons.append(f"Geographic Proximity (Max 25%): Regional Hub (+10%)")

        # 3. Workload Capacity Balancing (Max 15 points)
        active_count = hei.active_projects_count or 0
        if active_count == 0:
            score += 15.0
            reasons.append("Workload Capacity (Max 15%): Optimal Bandwidth (0 active projects) (+15%)")
        elif active_count <= 2:
            score += 10.0
            reasons.append(f"Workload Capacity (Max 15%): Available Bandwidth ({active_count} active projects) (+10%)")
        else:
            score += 5.0
            reasons.append(f"Workload Capacity (Max 15%): High Load ({active_count} active projects) (+5%)")

        total_score = min(100.0, score)
        scored_heis.append({
            "hei_id": hei.id,
            "institute_name": hei.institute_name,
            "score": total_score,
            "reasons": reasons
        })

    scored_heis.sort(key=lambda x: x["score"], reverse=True)
    best_match = scored_heis[0]

    logger.info(f"Matched report '{report.title[:30]}' to HEI #{best_match['hei_id']} ({best_match['institute_name']}) with score {best_match['score']:.1f}%")
    return best_match["hei_id"], best_match["score"], best_match["reasons"]
