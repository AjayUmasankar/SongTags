from fastapi import APIRouter

from models.user import UserModel
import database.database as db


router = APIRouter(
    prefix="/user",
    tags=["user"],
    # responses={404: {"description": "Not found"}},
)


# @router.get("/{username}", description="Returns the user and all of their tags", response_model=UserModel)
# async def getUser(username: str):
#     return await db.set_default_user(username)