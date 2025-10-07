
use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use mongodb::{Client, Collection, bson::doc};
use serde::{Deserialize, Serialize};
use std::env;
use log::{info, error};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Todo {
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<String>,
    title: String,
    completed: bool,
    created_at: String,
}

#[derive(Clone)]
struct AppState {
    collection: Collection<Todo>,
}

// GET /health - Health check
async fn health_check() -> impl Responder {
    info!("Health check requested");
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "rust-todo-api",
        "version": "0.1.0"
    }))
}

// GET /todos - Obtener todas las tareas
async fn get_todos(data: web::Data<AppState>) -> impl Responder {
    info!("Fetching all todos");
    
    match data.collection.find(doc! {}, None).await {
        Ok(mut cursor) => {
            let mut todos = Vec::new();
            
            while let Ok(true) = cursor.advance().await {
                if let Ok(todo) = cursor.deserialize_current() {
                    todos.push(todo);
                }
            }
            
            info!("Found {} todos", todos.len());
            HttpResponse::Ok().json(todos)
        }
        Err(e) => {
            error!("Error fetching todos: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch todos"
            }))
        }
    }
}

// POST /todos - Crear nueva tarea
async fn create_todo(
    data: web::Data<AppState>,
    todo: web::Json<Todo>,
) -> impl Responder {
    info!("Creating new todo: {}", todo.title);
    
    let new_todo = Todo {
        id: Some(mongodb::bson::oid::ObjectId::new().to_hex()),
        title: todo.title.clone(),
        completed: false,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    
    match data.collection.insert_one(&new_todo, None).await {
        Ok(_) => {
            info!("Todo created successfully: {}", new_todo.title);
            HttpResponse::Created().json(new_todo)
        }
        Err(e) => {
            error!("Error creating todo: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create todo"
            }))
        }
    }
}

// PUT /todos/{id} - Actualizar tarea
async fn update_todo(
    data: web::Data<AppState>,
    id: web::Path<String>,
) -> impl Responder {
    info!("Toggling todo: {}", id);
    
    match data.collection.find_one(doc! { "id": id.as_str() }, None).await {
        Ok(Some(mut todo)) => {
            todo.completed = !todo.completed;
            
            match data.collection.replace_one(
                doc! { "id": id.as_str() },
                &todo,
                None,
            ).await {
                Ok(_) => {
                    info!("Todo toggled successfully: {}", id);
                    HttpResponse::Ok().json(todo)
                }
                Err(e) => {
                    error!("Error updating todo: {}", e);
                    HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to update todo"
                    }))
                }
            }
        }
        Ok(None) => {
            error!("Todo not found: {}", id);
            HttpResponse::NotFound().json(serde_json::json!({
                "error": "Todo not found"
            }))
        }
        Err(e) => {
            error!("Error finding todo: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to find todo"
            }))
        }
    }
}

// DELETE /todos/{id} - Eliminar tarea
async fn delete_todo(
    data: web::Data<AppState>,
    id: web::Path<String>,
) -> impl Responder {
    info!("Deleting todo: {}", id);
    
    match data.collection.delete_one(doc! { "id": id.as_str() }, None).await {
        Ok(result) => {
            if result.deleted_count > 0 {
                info!("Todo deleted successfully: {}", id);
                HttpResponse::Ok().json(serde_json::json!({
                    "message": "Todo deleted successfully"
                }))
            } else {
                error!("Todo not found: {}", id);
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Todo not found"
                }))
            }
        }
        Err(e) => {
            error!("Error deleting todo: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to delete todo"
            }))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Inicializar logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Leer variables de entorno
    let mongo_uri = env::var("MONGODB_URI")
        .unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a number");
    
    info!("Starting Rust TODO API");
    info!("Connecting to MongoDB at: {}", mongo_uri);
    
    // Conectar a MongoDB con reintentos
    let client = loop {
        match Client::with_uri_str(&mongo_uri).await {
            Ok(client) => {
                info!("Successfully connected to MongoDB");
                break client;
            }
            Err(e) => {
                error!("Failed to connect to MongoDB: {}. Retrying in 5 seconds...", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        }
    };
    
    let db = client.database("tododb");
    let collection: Collection<Todo> = db.collection("todos");
    
    let app_state = web::Data::new(AppState { collection });
    
    info!("Starting HTTP server on 0.0.0.0:{}", port);
    
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .route("/health", web::get().to(health_check))
            .route("/todos", web::get().to(get_todos))
            .route("/todos", web::post().to(create_todo))
            .route("/todos/{id}", web::put().to(update_todo))
            .route("/todos/{id}", web::delete().to(delete_todo))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}