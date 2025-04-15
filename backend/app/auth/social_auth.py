from typing import Dict, Any
import aiohttp
from app.core.config import settings

async def get_google_auth_url() -> str:
    """
    Generate Google OAuth URL
    """
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    return f"{base_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"

async def get_google_user_info(code: str) -> Dict[str, Any]:
    """
    Get user info from Google using authorization code
    """
    try:
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        async with aiohttp.ClientSession() as session:
            async with session.post(token_url, data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise Exception(f"Token exchange failed: {error_data}")
                
                token_data = await response.json()
                if "access_token" not in token_data:
                    raise Exception("No access token in response")
                
                access_token = token_data["access_token"]

            # Get user info
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            async with session.get(userinfo_url, headers={
                "Authorization": f"Bearer {access_token}"
            }) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise Exception(f"User info fetch failed: {error_data}")
                
                user_info = await response.json()
                if "email" not in user_info:
                    raise Exception("No email in user info")
                
                return {
                    "email": user_info["email"],
                    "name": user_info.get("name", ""),
                    "picture": user_info.get("picture", "")
                }
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")  # For debugging
        raise

async def get_facebook_auth_url() -> str:
    """
    Generate Facebook OAuth URL
    """
    base_url = "https://www.facebook.com/v12.0/dialog/oauth"
    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": "email,public_profile",
        "response_type": "code"
    }
    return f"{base_url}?{'&'.join(f'{k}={v}' for k, v in params.items())}"

async def get_facebook_user_info(code: str) -> Dict[str, Any]:
    """
    Get user info from Facebook using authorization code
    """
    # Exchange code for access token
    token_url = "https://graph.facebook.com/v12.0/oauth/access_token"
    async with aiohttp.ClientSession() as session:
        async with session.get(token_url, params={
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "client_secret": settings.FACEBOOK_CLIENT_SECRET,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "code": code
        }) as response:
            token_data = await response.json()
            access_token = token_data["access_token"]

        # Get user info
        userinfo_url = "https://graph.facebook.com/v12.0/me"
        async with session.get(userinfo_url, params={
            "fields": "id,name,email,picture",
            "access_token": access_token
        }) as response:
            user_info = await response.json()
            return {
                "email": user_info["email"],
                "name": user_info["name"],
                "picture": user_info.get("picture", {}).get("data", {}).get("url", "")
            }