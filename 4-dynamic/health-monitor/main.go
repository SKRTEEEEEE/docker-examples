package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type FeedHealth struct {
	URL      string    `json:"url"`
	Status   string    `json:"status"`
	Latency  int64     `json:"latency"`
	CheckedAt time.Time `json:"checked_at"`
}

var db *sql.DB

func init() {
	var err error
	
	// PostgreSQL connection
	pgHost := getEnv("POSTGRES_HOST", "postgres")
	pgUser := getEnv("POSTGRES_USER", "postgres")
	pgPassword := getEnv("POSTGRES_PASSWORD", "postgres")
	pgDB := getEnv("POSTGRES_DB", "feeds")
	
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", 
		pgHost, pgUser, pgPassword, pgDB)
	
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL:", err)
	}
	
	log.Println("Health Monitor initialized")
}

func main() {
	// Initialize database schema
	initDB()
	
	// Start health check routine
	go healthCheckRoutine()
	
	// HTTP server
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/feeds", feedsHandler)
	http.HandleFunc("/feeds/add", addFeedHandler)
	http.HandleFunc("/metrics", metricsHandler)
	
	port := getEnv("PORT", "8080")
	log.Printf("Health Monitor listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func initDB() {
	query := `
	CREATE TABLE IF NOT EXISTS feeds (
		id SERIAL PRIMARY KEY,
		url TEXT UNIQUE NOT NULL,
		status VARCHAR(10) DEFAULT 'unknown',
		last_checked TIMESTAMP,
		latency_ms INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT NOW()
	)`
	
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}
	
	log.Println("Database initialized")
}

func healthCheckRoutine() {
	checkInterval := getEnv("CHECK_INTERVAL", "30s")
	duration, _ := time.ParseDuration(checkInterval)
	
	ticker := time.NewTicker(duration)
	defer ticker.Stop()
	
	for range ticker.C {
		checkAllFeeds()
	}
}

func checkAllFeeds() {
	rows, err := db.Query("SELECT id, url FROM feeds")
	if err != nil {
		log.Println("Error querying feeds:", err)
		return
	}
	defer rows.Close()
	
	for rows.Next() {
		var id int
		var url string
		rows.Scan(&id, &url)
		
		go checkFeed(id, url)
	}
}

func checkFeed(id int, url string) {
	start := time.Now()
	resp, err := http.Get(url)
	latency := time.Since(start).Milliseconds()
	
	status := "red"
	if err == nil {
		resp.Body.Close()
		if resp.StatusCode == 200 {
			if latency < 1000 {
				status = "green"
			} else if latency < 3000 {
				status = "yellow"
			}
		}
	}
	
	// Update PostgreSQL with latency tracking
	_, err = db.Exec(
		"UPDATE feeds SET status = $1, last_checked = $2, latency_ms = $3 WHERE id = $4",
		status, time.Now(), latency, id,
	)
	if err != nil {
		log.Println("Error updating feed status:", err)
	}
	
	log.Printf("Checked feed %s: %s (%dms)", url, status, latency)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "health-monitor", "health": "good"})
}

func feedsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT url, status, last_checked, latency_ms FROM feeds ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	var feeds []map[string]interface{}
	for rows.Next() {
		var url, status string
		var lastChecked *time.Time
		var latency int64
		rows.Scan(&url, &status, &lastChecked, &latency)
		
		feed := map[string]interface{}{
			"url":        url,
			"status":     status,
			"latency_ms": latency,
		}
		if lastChecked != nil {
			feed["last_checked"] = lastChecked.Format(time.RFC3339)
		}
		feeds = append(feeds, feed)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(feeds)
}

func addFeedHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var data struct {
		URL string `json:"url"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	_, err := db.Exec("INSERT INTO feeds (url) VALUES ($1) ON CONFLICT (url) DO NOTHING", data.URL)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "created", "url": data.URL})
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT status, AVG(latency_ms) as avg_latency, COUNT(*) as count FROM feeds WHERE status != 'unknown' GROUP BY status")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	metrics := make(map[string]interface{})
	for rows.Next() {
		var status string
		var avgLatency float64
		var count int
		rows.Scan(&status, &avgLatency, &count)
		metrics[status] = map[string]interface{}{
			"count":       count,
			"avg_latency": avgLatency,
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
