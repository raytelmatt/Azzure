import requests
import time

# Common Railway URL patterns to test
base_urls = [
    "https://azzure-production.up.railway.app",
    "https://azzure.up.railway.app",
    "https://entity-tracker-production.up.railway.app",
    "https://entity-tracker.up.railway.app",
    "https://precious-youthfulness-production.up.railway.app"
]

print("Testing Railway deployment URLs...\n")

for url in base_urls:
    try:
        print(f"Testing {url}...")
        response = requests.get(f"{url}/api/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ FOUND! Status: {response.json()}")
            print(f"Full URL: {url}")
            
            # Test root endpoint
            root = requests.get(url, timeout=5)
            print(f"Root response: {root.json()}")
            break
        else:
            print(f"   Status code: {response.status_code}")
    except requests.exceptions.Timeout:
        print(f"   Timeout")
    except requests.exceptions.ConnectionError:
        print(f"   Connection error")
    except Exception as e:
        print(f"   Error: {e}")
    print()

print("If none worked, check your Railway dashboard for the correct URL.")

