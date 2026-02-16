import re
from typing import List, Dict
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import numpy as np

# --- SDG label set (name + concise description for stronger semantics) ---
SDG_LABELS = [
    ("SDG 1: No Poverty", "End poverty in all its forms everywhere."),
    ("SDG 2: Zero Hunger", "End hunger, achieve food security, improve nutrition, and promote sustainable agriculture."),
    ("SDG 3: Good Health and Well-being", "Ensure healthy lives and promote well-being for all at all ages."),
    ("SDG 4: Quality Education", "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all."),
    ("SDG 5: Gender Equality", "Achieve gender equality and empower all women and girls."),
    ("SDG 6: Clean Water and Sanitation", "Ensure availability and sustainable management of water and sanitation for all."),
    ("SDG 7: Affordable and Clean Energy", "Ensure access to affordable, reliable, sustainable and modern energy for all."),
    ("SDG 8: Decent Work and Economic Growth", "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all."),
    ("SDG 9: Industry, Innovation and Infrastructure", "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation."),
    ("SDG 10: Reduced Inequalities", "Reduce inequality within and among countries."),
    ("SDG 11: Sustainable Cities and Communities", "Make cities and human settlements inclusive, safe, resilient and sustainable."),
    ("SDG 12: Responsible Consumption and Production", "Ensure sustainable consumption and production patterns."),
    ("SDG 13: Climate Action", "Take urgent action to combat climate change and its impacts."),
    ("SDG 14: Life Below Water", "Conserve and sustainably use the oceans, seas and marine resources for sustainable development."),
    ("SDG 15: Life on Land", "Protect, restore and promote sustainable use of terrestrial ecosystems; sustainably manage forests; combat desertification; halt biodiversity loss."),
    ("SDG 16: Peace, Justice and Strong Institutions", "Promote peaceful and inclusive societies, provide access to justice for all, and build effective, accountable institutions at all levels."),
    ("SDG 17: Partnerships for the Goals", "Strengthen the means of implementation and revitalize the global partnership for sustainable development.")
]

SDG_NAMES = [n for (n, _) in SDG_LABELS]
SDG_DESCS = [d for (_, d) in SDG_LABELS]

# --- Zero-shot and embedding models (lazy-load) ---
_zeroshot = None
_embedder = None

def get_zeroshot():
    """Lazy load zero-shot classification model."""
    global _zeroshot
    if _zeroshot is None:
        _zeroshot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device_map="auto")
    return _zeroshot

def get_embedder():
    """Lazy load sentence transformer model."""
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _embedder

def clean_text(text: str) -> str:
    """Clean and normalize input text."""
    # Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

def zero_shot_scores(text: str, labels: List[str]) -> tuple[np.ndarray, Dict]:
    """
    Returns probabilities for each label using NLI zero-shot (multi-label).
    Returns (scores_array, detailed_info_dict)
    """
    clf = get_zeroshot()
    out = clf(text, labels, multi_label=True)
    detailed_info = {
        "labels": out["labels"],
        "scores": out["scores"],
        "sequence": text[:500] + "..." if len(text) > 500 else text
    }
    return np.array(out["scores"], dtype=float), detailed_info

def embedding_similarity_scores(text: str, label_texts: List[str]) -> np.ndarray:
    """
    Cosine similarity between text embedding and each label description.
    Returns normalized similarity scores (0-1 range).
    """
    emb = get_embedder()
    v_text = emb.encode([text], normalize_embeddings=True)[0]
    v_lbls = emb.encode(label_texts, normalize_embeddings=True)
    sims = np.dot(v_lbls, v_text)  # cosine since normalized
    # Normalize to 0..1
    sims = (sims - sims.min()) / (sims.max() - sims.min() + 1e-8)
    return sims

def ensemble_scores(zs: np.ndarray, es: np.ndarray, alpha: float = 0.8) -> np.ndarray:
    """
    Combine zero-shot and embedding scores.
    alpha: weight for zero-shot (default 0.8 means 80% zero-shot, 20% embedding)
    """
    return alpha * zs + (1 - alpha) * es

def classify_text(
    text: str, 
    threshold: float = 0.4, 
    top_k: int = 10, 
    use_ensemble: bool = True,
    verbose: bool = True
) -> Dict:
    """
    Classify project description text against SDGs.
    
    Args:
        text: Project description text to classify
        threshold: Minimum score for SDG inclusion (0-1)
        top_k: Maximum number of predictions to return
        use_ensemble: Whether to combine zero-shot + embedding models
        verbose: Whether to print detailed classification info
    
    Returns:
        Dictionary with predictions and metadata
    """
    # Clean and validate text
    text = clean_text(text)
    if not text:
        raise ValueError("Input text is empty. Please provide a project description.")
    
    # Cap text length for processing speed
    text = text[:6000]
    
    # Zero-shot classification
    zs, zs_details = zero_shot_scores(text, SDG_NAMES)
    
    if verbose:
       
        
        label_score_pairs = list(zip(zs_details["labels"], zs_details["scores"]))
        label_score_pairs.sort(key=lambda x: x[1], reverse=True)
        
        for label, score in label_score_pairs:
            
            if score > 0.9:
                confidence = "HIGH"
            elif score > 0.7:
                confidence = "MEDIUM"
            elif score > 0.5:
                confidence = "LOW"
            else:
                confidence = "VERY LOW"
         
        
 
    
    if use_ensemble:
        # Embedding similarity against SDG descriptions
        es = embedding_similarity_scores(text, SDG_DESCS)
        scores = ensemble_scores(zs, es, alpha=0.8)
        
        
    else:
        scores = zs
    
    # Rank and threshold
    idx = np.argsort(scores)[::-1]
    ranked = [(SDG_NAMES[i], float(scores[i])) for i in idx]
    
    # Filter by threshold
    selected = [(name, sc) for (name, sc) in ranked if sc >= threshold]
    if not selected:
        # If nothing meets threshold, return top 1-3
        selected = ranked[:max(1, min(top_k, 3))]
    
    return {
        "predictions": selected[:top_k],
        "top_all": ranked[:top_k],
        "method": "ensemble" if use_ensemble else "zero-shot",
        "text_length": len(text)
    }

def main(project_description: str, project_name: str = None, project_url: str = None) -> Dict:
    """
    Main entry point for text classification.
    
    Args:
        project_description: The project description text to classify
        project_name: Optional project name for metadata
        project_url: Optional project URL for metadata
    
    Returns:
        Dictionary with predictions and metadata
    """
    result = classify_text(project_description, threshold=0.4, use_ensemble=True, verbose=True)
    
    # Format predictions
    predictions = {
        "project_name": project_name or "Unknown",
        "project_url": project_url or "",
        "sdg_predictions": {
            name: float(f"{score:.3f}") for (name, score) in result["predictions"]
        },
        "method": result["method"],
        "text_length": result["text_length"]
    }
    
   
    
    return predictions

# Example usage
if __name__ == "__main__":
    sample_text = """
    Our project aims to provide clean water access to rural communities through 
    innovative filtration technology. We focus on sustainable solutions that empower 
    local communities and improve public health outcomes.
    """
    result = main(sample_text, project_name="Clean Water Initiative")
  
