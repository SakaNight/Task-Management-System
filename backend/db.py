from prisma import Prisma

db = Prisma()

async def get_db() -> Prisma:
    return db