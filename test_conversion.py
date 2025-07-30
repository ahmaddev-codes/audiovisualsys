import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent))

from app.convert import AIConverter

def test_audio_to_image():
    """Test audio to image conversion"""
    print("Testing audio to image conversion...")
    
    # Check if API keys are set
    openai_key = os.getenv('OPENAI_API_KEY')
    elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    if not openai_key:
        print("ERROR: OPENAI_API_KEY not set")
        return False
    
    if not elevenlabs_key:
        print("ERROR: ELEVENLABS_API_KEY not set")
        return False
    
    print("API keys are set")
    
    try:
        # Initialize converter
        converter = AIConverter()
        print("AIConverter initialized successfully")
        
        # Create a simple test audio file (this is just for testing the initialization)
        # In a real scenario, you would have an actual audio file
        print("Note: This test only checks initialization. For full testing, you need an actual audio file.")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_image_to_audio():
    """Test image to audio conversion"""
    print("\nTesting image to audio conversion...")
    
    try:
        # Initialize converter
        converter = AIConverter()
        print("AIConverter initialized successfully")
        
        # Create a simple test image file (this is just for testing the initialization)
        # In a real scenario, you would have an actual image file
        print("Note: This test only checks initialization. For full testing, you need an actual image file.")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    print("Testing AI Conversion System...")
    print("=" * 50)
    
    # Test audio to image
    audio_test = test_audio_to_image()
    
    # Test image to audio
    image_test = test_image_to_audio()
    
    print("\n" + "=" * 50)
    if audio_test and image_test:
        print("✅ All tests passed! The AI conversion system is properly configured.")
    else:
        print("❌ Some tests failed. Please check the error messages above.") 