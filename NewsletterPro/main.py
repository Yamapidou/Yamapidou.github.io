from app import app  # noqa: F401

# Make sure to initialize models
from models import User, Casier, Amende, Rapport  # noqa: F401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
