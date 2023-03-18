# from fastapi.middleware.cors import CORSMiddleware


# # Setup CORS
# # this is needed as we are recieving a request from youtube.com origin to our backend
# # the backend needs to say that it will accept requests from that verified origi
# # This is a list of URLs that will be authorized to connect to our backend
# corsOrigins = [
#     "http://localhost.tiangolo.com",
#     "https://localhost.tiangolo.com",
#     "http://localhost",
#     "http://localhost:8080",
#     "http://127.0.0.1:8000",
#     "https://www.youtube.com",
# ]

# def setupCors(app):
#     app.add_middleware(
#         CORSMiddleware,
#         allow_origins=corsOrigins,
#         allow_credentials=True,
#         allow_methods=["*"],
#         allow_headers=["*"],
#     )
