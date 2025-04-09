import os
import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")
app.config['DEBUG'] = True
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the database
db.init_app(app)

# Initialize login manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Load user for session
@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html')

# API routes for the client-side app

@app.route('/api/casiers', methods=['GET'])
def get_casiers():
    from models import Casier
    casiers = Casier.query.all()
    result = []
    for casier in casiers:
        result.append({
            'id': casier.id,
            'code': casier.code,
            'nom': casier.nom,
            'telephone': casier.telephone,
            'profession': casier.profession,
            'naissance': casier.date_naissance.strftime('%Y-%m-%d') if casier.date_naissance else None,
            'adresse': casier.adresse,
            'peine': casier.peine,
            'photo': casier.photo
        })
    return jsonify(result)

@app.route('/api/casiers', methods=['POST'])
def create_casier():
    from models import Casier
    data = request.json
    
    # Generate a new casier code
    last_casier = Casier.query.order_by(Casier.id.desc()).first()
    if last_casier:
        code = f"C-{(last_casier.id + 1):03d}"
    else:
        code = "C-001"
    
    # Create a new casier
    casier = Casier(
        code=code,
        nom=data.get('nom'),
        telephone=data.get('telephone'),
        profession=data.get('profession'),
        date_naissance=datetime.strptime(data.get('naissance'), '%Y-%m-%d') if data.get('naissance') else None,
        adresse=data.get('adresse'),
        peine=data.get('peine'),
        photo=data.get('photo'),
        agent_id=1  # Default to first user until login is implemented
    )
    
    db.session.add(casier)
    db.session.commit()
    
    return jsonify({
        'id': casier.id,
        'code': casier.code,
        'nom': casier.nom
    }), 201

@app.route('/api/casiers/<int:casier_id>', methods=['PUT'])
def update_casier(casier_id):
    from models import Casier
    casier = Casier.query.get_or_404(casier_id)
    data = request.json
    
    casier.nom = data.get('nom', casier.nom)
    casier.telephone = data.get('telephone', casier.telephone)
    casier.profession = data.get('profession', casier.profession)
    if data.get('naissance'):
        casier.date_naissance = datetime.strptime(data.get('naissance'), '%Y-%m-%d')
    casier.adresse = data.get('adresse', casier.adresse)
    casier.peine = data.get('peine', casier.peine)
    casier.photo = data.get('photo', casier.photo)
    
    db.session.commit()
    
    return jsonify({
        'id': casier.id,
        'code': casier.code,
        'nom': casier.nom
    })

@app.route('/api/casiers/<int:casier_id>', methods=['DELETE'])
def delete_casier(casier_id):
    from models import Casier
    casier = Casier.query.get_or_404(casier_id)
    
    db.session.delete(casier)
    db.session.commit()
    
    return jsonify({'success': True})

# Amendes routes
@app.route('/api/amendes', methods=['GET'])
def get_amendes():
    from models import Amende, Casier
    amendes = Amende.query.all()
    result = []
    for amende in amendes:
        casier_nom = amende.casier.nom if amende.casier else "Inconnu"
        result.append({
            'id': amende.id,
            'code': amende.code,
            'montant': amende.montant,
            'motif': amende.motif,
            'lieu': amende.lieu,
            'date_infraction': amende.date_infraction.strftime('%Y-%m-%d') if amende.date_infraction else None,
            'casier_id': amende.casier_id,
            'casier_nom': casier_nom
        })
    return jsonify(result)

@app.route('/api/amendes/<int:amende_id>', methods=['DELETE'])
def delete_amende(amende_id):
    from models import Amende
    amende = Amende.query.get_or_404(amende_id)
    db.session.delete(amende)
    db.session.commit()
    return jsonify({"message": "Amende supprimée", "id": amende_id}), 200

@app.route('/api/amendes', methods=['POST'])
def create_amende():
    from models import Amende
    data = request.json
    
    # Generate a new amende code
    last_amende = Amende.query.order_by(Amende.id.desc()).first()
    if last_amende:
        code = f"A-{(last_amende.id + 1):03d}"
    else:
        code = "A-001"
    
    # Create a new amende
    amende = Amende(
        code=code,
        montant=data.get('montant'),
        motif=data.get('motif'),
        lieu=data.get('lieu'),
        date_infraction=datetime.strptime(data.get('date_infraction'), '%Y-%m-%d') if data.get('date_infraction') else None,
        casier_id=data.get('casier_id'),
        agent_id=1  # Default to first user until login is implemented
    )
    
    db.session.add(amende)
    db.session.commit()
    
    return jsonify({
        'id': amende.id,
        'code': amende.code,
        'montant': amende.montant
    }), 201

# Rapports routes
@app.route('/api/rapports', methods=['GET'])
def get_rapports():
    from models import Rapport, Casier
    rapports = Rapport.query.all()
    result = []
    for rapport in rapports:
        casier_nom = rapport.casier.nom if rapport.casier else "Inconnu"
        result.append({
            'id': rapport.id,
            'code': rapport.code,
            'titre': rapport.titre,
            'contenu': rapport.contenu,
            'lieu': rapport.lieu,
            'date_incident': rapport.date_incident.strftime('%Y-%m-%d') if rapport.date_incident else None,
            'casier_id': rapport.casier_id,
            'casier_nom': casier_nom
        })
    return jsonify(result)

@app.route('/api/rapports/<int:rapport_id>', methods=['DELETE'])
def delete_rapport(rapport_id):
    from models import Rapport
    rapport = Rapport.query.get_or_404(rapport_id)
    db.session.delete(rapport)
    db.session.commit()
    return jsonify({"message": "Rapport supprimé", "id": rapport_id}), 200

@app.route('/api/rapports', methods=['POST'])
def create_rapport():
    from models import Rapport
    data = request.json
    
    # Generate a new rapport code
    last_rapport = Rapport.query.order_by(Rapport.id.desc()).first()
    if last_rapport:
        code = f"R-{(last_rapport.id + 1):03d}"
    else:
        code = "R-001"
    
    # Create a new rapport
    rapport = Rapport(
        code=code,
        titre=data.get('titre'),
        contenu=data.get('contenu'),
        lieu=data.get('lieu'),
        date_incident=datetime.strptime(data.get('date_incident'), '%Y-%m-%d') if data.get('date_incident') else None,
        casier_id=data.get('casier_id'),
        agent_id=1  # Default to first user until login is implemented
    )
    
    db.session.add(rapport)
    db.session.commit()
    
    # Récupérer le nom du casier
    casier_nom = None
    if rapport.casier_id:
        from models import Casier
        casier = Casier.query.get(rapport.casier_id)
        casier_nom = casier.nom if casier else "Inconnu"
    
    # Retourner toutes les informations du rapport pour éviter un rechargement
    return jsonify({
        'id': rapport.id,
        'code': rapport.code,
        'titre': rapport.titre,
        'contenu': rapport.contenu,
        'lieu': rapport.lieu,
        'date_incident': rapport.date_incident.strftime('%Y-%m-%d') if rapport.date_incident else None,
        'casier_id': rapport.casier_id,
        'casier_nom': casier_nom or "Non associé",
        'agent_id': rapport.agent_id
    }), 201

# PPA routes
@app.route('/api/ppas', methods=['GET'])
def get_ppas():
    from models import PPA, Casier
    ppas = PPA.query.all()
    result = []
    for ppa in ppas:
        casier_nom = ppa.casier.nom if ppa.casier else "Inconnu"
        result.append({
            'id': ppa.id,
            'code': ppa.code,
            'heure': ppa.heure,
            'test_psychologique': ppa.test_psychologique,
            'matricule_agent': ppa.matricule_agent,
            'modele_arme': ppa.modele_arme,
            'nombre_munitions': ppa.nombre_munitions,
            'casier_id': ppa.casier_id,
            'casier_nom': casier_nom
        })
    return jsonify(result)

@app.route('/api/ppas/<int:ppa_id>', methods=['DELETE'])
def delete_ppa(ppa_id):
    from models import PPA
    ppa = PPA.query.get_or_404(ppa_id)
    db.session.delete(ppa)
    db.session.commit()
    return jsonify({"message": "PPA supprimé", "id": ppa_id}), 200

@app.route('/api/ppas', methods=['POST'])
def create_ppa():
    from models import PPA
    data = request.json
    
    # Generate a new PPA code
    last_ppa = PPA.query.order_by(PPA.id.desc()).first()
    if last_ppa:
        code = f"P-{(last_ppa.id + 1):03d}"
    else:
        code = "P-001"
    
    # Create a new PPA
    date_test_psy = None
    if data.get('date_test_psy'):
        try:
            date_test_psy = datetime.strptime(data.get('date_test_psy'), '%Y-%m-%d')
        except ValueError:
            pass
    
    ppa = PPA(
        code=code,
        heure=data.get('heure'),
        personne_concernee=data.get('personne_concernee', ''),
        test_psychologique=data.get('test_psychologique', 'attente'),
        date_test_psy=date_test_psy,
        matricule_agent=data.get('matricule_agent'),
        modele_arme=data.get('modele_arme'),
        nombre_munitions=data.get('nombre_munitions'),
        casier_id=data.get('casier_id'),
        agent_id=1  # Default to first user until login is implemented
    )
    
    db.session.add(ppa)
    db.session.commit()
    
    # Récupérer le nom du casier
    casier_nom = None
    if ppa.casier_id:
        from models import Casier
        casier = Casier.query.get(ppa.casier_id)
        casier_nom = casier.nom if casier else "Inconnu"
    
    # Retourner toutes les informations du PPA
    return jsonify({
        'id': ppa.id,
        'code': ppa.code,
        'heure': ppa.heure,
        'personne_concernee': ppa.personne_concernee,
        'test_psychologique': ppa.test_psychologique,
        'date_test_psy': ppa.date_test_psy.strftime('%Y-%m-%d') if ppa.date_test_psy else None,
        'matricule_agent': ppa.matricule_agent,
        'modele_arme': ppa.modele_arme,
        'nombre_munitions': ppa.nombre_munitions,
        'casier_id': ppa.casier_id,
        'casier_nom': casier_nom or "Non associé",
        'agent_id': ppa.agent_id
    }), 201

# Route pour mettre à jour un PPA
@app.route('/api/ppas/<int:ppa_id>', methods=['PUT'])
def update_ppa(ppa_id):
    from models import PPA, Casier
    data = request.json
    ppa = PPA.query.get_or_404(ppa_id)
    
    # Update fields
    if 'personne_concernee' in data:
        ppa.personne_concernee = data['personne_concernee']
    if 'heure' in data:
        ppa.heure = data['heure']
    if 'test_psychologique' in data:
        ppa.test_psychologique = data['test_psychologique']
    if 'matricule_agent' in data:
        ppa.matricule_agent = data['matricule_agent']
    if 'modele_arme' in data:
        ppa.modele_arme = data['modele_arme']
    if 'nombre_munitions' in data:
        ppa.nombre_munitions = data['nombre_munitions']
    if 'casier_id' in data:
        ppa.casier_id = data['casier_id']
    
    # Handle date_test_psy if provided
    if 'date_test_psy' in data and data['date_test_psy']:
        try:
            ppa.date_test_psy = datetime.strptime(data['date_test_psy'], '%Y-%m-%d')
        except ValueError:
            pass
    
    db.session.commit()
    
    # Récupérer le nom du casier
    casier_nom = None
    if ppa.casier_id:
        casier = Casier.query.get(ppa.casier_id)
        casier_nom = casier.nom if casier else "Inconnu"
    
    # Return updated PPA
    return jsonify({
        'id': ppa.id,
        'code': ppa.code,
        'heure': ppa.heure,
        'personne_concernee': ppa.personne_concernee,
        'test_psychologique': ppa.test_psychologique,
        'date_test_psy': ppa.date_test_psy.strftime('%Y-%m-%d') if ppa.date_test_psy else None,
        'matricule_agent': ppa.matricule_agent,
        'modele_arme': ppa.modele_arme,
        'nombre_munitions': ppa.nombre_munitions,
        'casier_id': ppa.casier_id,
        'casier_nom': casier_nom or "Non associé",
        'agent_id': ppa.agent_id
    })

# Route pour mettre à jour une amende
@app.route('/api/amendes/<int:amende_id>', methods=['PUT'])
def update_amende(amende_id):
    from models import Amende, Casier
    data = request.json
    amende = Amende.query.get_or_404(amende_id)
    
    # Update fields
    if 'montant' in data:
        amende.montant = data['montant']
    if 'motif' in data:
        amende.motif = data['motif']
    if 'lieu' in data:
        amende.lieu = data['lieu']
    if 'casier_id' in data:
        amende.casier_id = data['casier_id']
    
    # Handle date if provided
    if 'date_infraction' in data and data['date_infraction']:
        try:
            amende.date_infraction = datetime.strptime(data['date_infraction'], '%Y-%m-%d')
        except ValueError:
            pass
    
    db.session.commit()
    
    # Get casier name for response
    casier_nom = None
    if amende.casier_id:
        casier = Casier.query.get(amende.casier_id)
        casier_nom = casier.nom if casier else "Inconnu"
    
    # Return updated Amende
    return jsonify({
        'id': amende.id,
        'code': amende.code,
        'montant': amende.montant,
        'motif': amende.motif,
        'lieu': amende.lieu,
        'date_infraction': amende.date_infraction.strftime('%Y-%m-%d') if amende.date_infraction else None,
        'casier_id': amende.casier_id,
        'casier_nom': casier_nom or "Non associé",
        'agent_id': amende.agent_id
    })

# Route pour mettre à jour un rapport
@app.route('/api/rapports/<int:rapport_id>', methods=['PUT'])
def update_rapport(rapport_id):
    from models import Rapport, Casier
    data = request.json
    rapport = Rapport.query.get_or_404(rapport_id)
    
    # Update fields
    if 'titre' in data:
        rapport.titre = data['titre']
    if 'contenu' in data:
        rapport.contenu = data['contenu']
    if 'lieu' in data:
        rapport.lieu = data['lieu']
    if 'casier_id' in data:
        rapport.casier_id = data['casier_id']
    
    # Handle date if provided
    if 'date_incident' in data and data['date_incident']:
        try:
            rapport.date_incident = datetime.strptime(data['date_incident'], '%Y-%m-%d')
        except ValueError:
            pass
    
    db.session.commit()
    
    # Get casier name for response
    casier_nom = None
    if rapport.casier_id:
        casier = Casier.query.get(rapport.casier_id)
        casier_nom = casier.nom if casier else "Inconnu"
    
    # Return updated Rapport
    return jsonify({
        'id': rapport.id,
        'code': rapport.code,
        'titre': rapport.titre,
        'contenu': rapport.contenu,
        'lieu': rapport.lieu,
        'date_incident': rapport.date_incident.strftime('%Y-%m-%d') if rapport.date_incident else None,
        'casier_id': rapport.casier_id,
        'casier_nom': casier_nom or "Non associé",
        'agent_id': rapport.agent_id
    })

# Timer Sessions API routes
@app.route('/api/timer-sessions', methods=['GET'])
def get_timer_sessions():
    from models import TimerSession
    sessions = TimerSession.query.order_by(TimerSession.date_creation.desc()).all()
    result = []
    for session in sessions:
        result.append({
            'id': session.id,
            'code': session.code,
            'date': session.date.strftime('%Y-%m-%d') if session.date else None,
            'heure_debut': session.heure_debut,
            'duree_secondes': session.duree_secondes,
            'duree_formatee': session.duree_formatee,
            'date_creation': session.date_creation.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(result)

@app.route('/api/timer-sessions', methods=['POST'])
def create_timer_session():
    from models import TimerSession
    data = request.json
    
    # Generate a new session code
    last_session = TimerSession.query.order_by(TimerSession.id.desc()).first()
    if last_session:
        code = f"T-{(last_session.id + 1):03d}"
    else:
        code = "T-001"
    
    # Create a new timer session
    session = TimerSession(
        code=code,
        heure_debut=data.get('heure_debut'),
        duree_secondes=data.get('duree_secondes'),
        duree_formatee=data.get('duree_formatee'),
        agent_id=1  # Default to first user until login is implemented
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'id': session.id,
        'code': session.code,
        'date': session.date.strftime('%Y-%m-%d') if session.date else None,
        'heure_debut': session.heure_debut,
        'duree_secondes': session.duree_secondes,
        'duree_formatee': session.duree_formatee
    }), 201

@app.route('/api/timer-sessions/<int:session_id>', methods=['DELETE'])
def delete_timer_session(session_id):
    from models import TimerSession
    session = TimerSession.query.get_or_404(session_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": "Session de chronomètre supprimée", "id": session_id}), 200

# Create the database tables
with app.app_context():
    from models import User, Casier, Amende, Rapport, PPA, TimerSession
    db.create_all()
    
    # Create a default user if none exists
    if not User.query.first():
        default_user = User(
            username="admin",
            email="admin@lspd.gov",
            password_hash=generate_password_hash("lspd123")
        )
        db.session.add(default_user)
        db.session.commit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
