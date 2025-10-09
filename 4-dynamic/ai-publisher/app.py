import os
import json
import time
import logging
import threading
from datetime import datetime
from flask import Flask, jsonify, request
import redis
from pymongo import MongoClient
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

worker_started = False

redis_config = {
    'host': os.getenv('REDIS_HOST', 'redis'),
    'port': int(os.getenv('REDIS_PORT', '6379')),
    'decode_responses': True
}
if os.getenv('REDIS_PASSWORD'):
    redis_config['password'] = os.getenv('REDIS_PASSWORD')

redis_client = redis.Redis(**redis_config)

mongo_client = MongoClient(
    host=os.getenv('MONGO_HOST', 'mongodb'),
    port=int(os.getenv('MONGO_PORT', '27017')),
    username=os.getenv('MONGO_USER', 'root'),
    password=os.getenv('MONGO_PASSWORD', 'example')
)

db = mongo_client[os.getenv('MONGO_DB', 'articles')]
articles_collection = db['articles']
rules_collection = db['publishing_rules']

CATEGORIES = ['Technology', 'Finance', 'Health', 'Politics', 'Entertainment', 'General']

def classify_article_keyword(text):
    """Clasificación basada en palabras clave"""
    text_lower = text.lower()
    
    keywords = {
        'Technology': ['tech', 'software', 'ai', 'computer', 'digital', 'app', 'code', 'data', 'internet', 'algorithm'],
        'Finance': ['money', 'bank', 'stock', 'market', 'invest', 'economy', 'finance', 'trading', 'crypto', 'currency'],
        'Health': ['health', 'medical', 'doctor', 'disease', 'hospital', 'medicine', 'patient', 'treatment', 'wellness'],
        'Politics': ['government', 'election', 'president', 'vote', 'congress', 'senate', 'law', 'policy', 'minister'],
        'Entertainment': ['movie', 'music', 'celebrity', 'film', 'concert', 'show', 'actor', 'artist', 'game'],
    }
    
    scores = {cat: 0 for cat in keywords.keys()}
    
    for category, words in keywords.items():
        for word in words:
            if word in text_lower:
                scores[category] += 1
    
    max_score = max(scores.values())
    if max_score == 0:
        return 'General'
    
    return max(scores, key=scores.get)

def classify_article_ai(text):
    """Clasificación mejorada con IA usando OpenAI o Anthropic"""
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    
    if not openai_key and not anthropic_key:
        logger.warning("No AI API keys configured, falling back to keyword classification")
        return classify_article_keyword(text)
    
    try:
        if openai_key:
            import openai
            openai.api_key = openai_key
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are a content classifier. Classify the following text into one of these categories: {', '.join(CATEGORIES[:-1])}. Respond with only the category name."},
                    {"role": "user", "content": text[:1000]}
                ],
                max_tokens=20,
                temperature=0.3
            )
            category = response.choices[0].message.content.strip()
            if category in CATEGORIES:
                return category
        
        return classify_article_keyword(text)
        
    except Exception as e:
        logger.error(f"AI classification error: {e}")
        return classify_article_keyword(text)

def classify_article(text):
    """Clasificar artículo según método configurado"""
    ai_model = os.getenv('AI_MODEL', 'keyword')
    
    if ai_model in ('openai', 'anthropic'):
        return classify_article_ai(text)
    else:
        return classify_article_keyword(text)

def generate_summary(text, max_length=150):
    """Simple extractive summary"""
    sentences = text.split('.')
    summary = sentences[0] if sentences else text
    
    if len(summary) > max_length:
        summary = summary[:max_length].rsplit(' ', 1)[0] + '...'
    
    return summary.strip()

def should_publish(article_data):
    """Check publishing rules"""
    rules = list(rules_collection.find())
    
    if not rules:
        return True, "No rules defined"
    
    for rule in rules:
        category = rule.get('category')
        min_summary_length = rule.get('min_summary_length', 0)
        
        if category and category != article_data['category']:
            continue
        
        if len(article_data['summary']) < min_summary_length:
            return False, f"Summary too short for {category}"
    
    return True, "Passed all rules"

def process_article(article_json):
    """Process and enrich article"""
    try:
        article = json.loads(article_json)
        
        category = classify_article(article['content'])
        summary = generate_summary(article['content'])
        
        enriched = {
            'title': article['title'],
            'link': article['link'],
            'source': article['source'],
            'pub_date': article.get('pubDate'),
            'content': article['content'],
            'category': category,
            'summary': summary,
            'hash': article['hash'],
            'processed_at': datetime.utcnow(),
        }
        
        should_pub, reason = should_publish(enriched)
        enriched['should_publish'] = should_pub
        enriched['publish_decision_reason'] = reason
        
        result = articles_collection.insert_one(enriched)
        
        logger.info(f"Processed article: {article['title']} | Category: {category} | Publish: {should_pub}")
        
        return enriched
        
    except Exception as e:
        logger.error(f"Error processing article: {e}")
        return None

def worker_loop():
    """Main worker loop that processes articles from queue"""
    logger.info("AI Publisher worker started")
    
    while True:
        try:
            article_json = redis_client.brpop('articles:queue', timeout=5)
            
            if article_json:
                _, data = article_json
                process_article(data)
                
        except Exception as e:
            logger.error(f"Worker error: {e}")
            time.sleep(1)

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'ai-publisher', 'health': 'good'})

@app.route('/articles')
def get_articles():
    limit = int(request.args.get('limit', 10))
    category = request.args.get('category')
    
    query = {}
    if category:
        query['category'] = category
    
    articles = list(articles_collection.find(query).sort('processed_at', -1).limit(limit))
    
    for article in articles:
        article['_id'] = str(article['_id'])
        if 'processed_at' in article:
            article['processed_at'] = article['processed_at'].isoformat()
    
    return jsonify(articles)

@app.route('/articles/<article_hash>')
def get_article(article_hash):
    article = articles_collection.find_one({'hash': article_hash})
    
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    article['_id'] = str(article['_id'])
    if 'processed_at' in article:
        article['processed_at'] = article['processed_at'].isoformat()
    
    return jsonify(article)

@app.route('/stats')
def stats():
    total = articles_collection.count_documents({})
    by_category = {}
    
    for category in CATEGORIES + ['General']:
        count = articles_collection.count_documents({'category': category})
        if count > 0:
            by_category[category] = count
    
    publishable = articles_collection.count_documents({'should_publish': True})
    
    return jsonify({
        'total_articles': total,
        'by_category': by_category,
        'publishable': publishable,
        'queue_length': redis_client.llen('articles:queue')
    })

@app.route('/rules', methods=['GET', 'POST'])
def rules():
    if request.method == 'POST':
        rule = request.json
        rules_collection.insert_one(rule)
        return jsonify({'status': 'created', 'rule': rule})
    else:
        rules_list = list(rules_collection.find())
        for rule in rules_list:
            rule['_id'] = str(rule['_id'])
        return jsonify(rules_list)

def start_worker():
    global worker_started
    if not worker_started:
        worker_started = True
        worker_thread = threading.Thread(target=worker_loop, daemon=True)
        worker_thread.start()
        logger.info("Worker thread started")

start_worker()

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port)
