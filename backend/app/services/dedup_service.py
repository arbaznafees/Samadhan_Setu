import logging
from typing import Tuple, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.entities import Report

logger = logging.getLogger(__name__)

# Cosine similarity threshold for flagging duplicate reports
DUPLICATE_SIMILARITY_THRESHOLD = 0.80

def check_duplicate_report(
    db: Session,
    embedding: List[float],
    current_report_id: Optional[int] = None,
    threshold: float = DUPLICATE_SIMILARITY_THRESHOLD
) -> Tuple[bool, Optional[int], Optional[float]]:
    """
    Compares the given report embedding with existing open reports in PostgreSQL via pgvector.
    Returns: (is_duplicate: bool, duplicate_of_id: Optional[int], similarity: Optional[float])
    """
    if not embedding or len(embedding) == 0:
        return False, None, None

    try:
        # Format embedding vector for pgvector format string: '[0.1,0.2,...]'
        vector_str = f"[{','.join(str(round(x, 6)) for x in embedding)}]"
        
        # Query using pgvector cosine distance operator (<=>)
        # Cosine distance = 1 - cosine_similarity. So similarity = 1 - distance.
        query_sql = text("""
            SELECT id, title, (1 - (embedding <=> :vec::vector)) AS similarity
            FROM reports
            WHERE embedding IS NOT NULL
              AND (:curr_id IS NULL OR id != :curr_id)
              AND status NOT IN ('Resolved', 'Rejected')
            ORDER BY embedding <=> :vec::vector ASC
            LIMIT 1;
        """)
        
        result = db.execute(
            query_sql,
            {"vec": vector_str, "curr_id": current_report_id or -1}
        ).fetchone()

        if result:
            matched_id = result[0]
            similarity = float(result[2])
            logger.info(f"Deduplication vector check: Closest report #{matched_id} with similarity {similarity:.4f}")
            
            if similarity >= threshold:
                logger.info(f"Report flagged as DUPLICATE of #{matched_id} (similarity: {similarity:.2%})")
                return True, matched_id, round(similarity, 4)
            else:
                return False, None, round(similarity, 4)
        
        return False, None, None

    except Exception as e:
        # Fallback to in-memory cosine similarity calculation across existing reports
        reports = db.query(Report).filter(
            Report.embedding.isnot(None),
            Report.status.notin_(["Resolved", "Rejected"])
        ).all()
        
        best_sim = 0.0
        best_id = None

        norm_q = sum(x * x for x in embedding) ** 0.5 or 1.0

        for r in reports:
            if current_report_id and r.id == current_report_id:
                continue
            r_emb = r.embedding
            if r_emb and len(r_emb) == len(embedding):
                dot = sum(a * b for a, b in zip(embedding, r_emb))
                norm_r = sum(x * x for x in r_emb) ** 0.5 or 1.0
                sim = dot / (norm_q * norm_r)
                if sim > best_sim:
                    best_sim = sim
                    best_id = r.id

        if best_id and best_sim >= threshold:
            logger.info(f"Report flagged as DUPLICATE of #{best_id} (cosine similarity: {best_sim:.2%})")
            return True, best_id, round(best_sim, 4)
        elif best_id:
            return False, None, round(best_sim, 4)
        
        return False, None, None
