"""
Quick test script to verify Supabase connection before running the scraper
Run this first to ensure your credentials are correct!
"""

from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print("=" * 60)
print("🔍 Testing Supabase Connection")
print("=" * 60)

# Check if credentials exist
if not url:
    print("❌ ERROR: SUPABASE_URL not found in .env file")
    print("   Please update backend/.env with your Supabase URL")
    exit(1)

if not key:
    print("❌ ERROR: SUPABASE_KEY not found in .env file")
    print("   Please update backend/.env with your service_role key")
    exit(1)

print(f"✅ SUPABASE_URL: {url}")
print(f"✅ SUPABASE_KEY: {key[:20]}...{key[-10:]}")
print()

# Test connection
try:
    print("🔄 Connecting to Supabase...")
    supabase = create_client(url, key)
    
    print("🔄 Checking jobs table...")
    result = supabase.table('jobs').select("*").limit(5).execute()
    
    print()
    print("=" * 60)
    print("✅ SUCCESS! Connection established!")
    print("=" * 60)
    print(f"📊 Current jobs in database: {len(result.data)}")
    
    if len(result.data) > 0:
        print(f"📋 Sample job: {result.data[0].get('title', 'N/A')}")
        print(f"   Company: {result.data[0].get('company_name', 'N/A')}")
        print(f"   Location: {result.data[0].get('location', 'N/A')}")
    else:
        print("ℹ️  No jobs in database yet - ready to scrape!")
    
    print()
    print("🎉 You're all set! Run the scraper with:")
    print("   python scraper/scraper.py")
    print()

except Exception as e:
    print()
    print("=" * 60)
    print("❌ CONNECTION FAILED!")
    print("=" * 60)
    print(f"Error: {str(e)}")
    print()
    print("💡 Common fixes:")
    print("   1. Make sure you're using SERVICE ROLE key (not anon key)")
    print("   2. Check your .env file is in backend/ folder")
    print("   3. Verify your Supabase URL is correct")
    print("   4. Run the jobs table migration if you haven't already")
    print()
    exit(1)
