from app import db
from datetime import datetime
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    
    casiers = db.relationship('Casier', backref='agent', lazy='dynamic')
    amendes = db.relationship('Amende', backref='agent', lazy='dynamic')
    rapports = db.relationship('Rapport', backref='agent', lazy='dynamic')
    ppas = db.relationship('PPA', backref='agent', lazy='dynamic')
    timer_sessions = db.relationship('TimerSession', backref='agent', lazy='dynamic')

class Casier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True) 
    nom = db.Column(db.String(100), nullable=False)
    telephone = db.Column(db.String(20))
    profession = db.Column(db.String(100))
    date_naissance = db.Column(db.Date)
    adresse = db.Column(db.String(255))
    peine = db.Column(db.Text)
    photo = db.Column(db.Text)  # Base64 encoded image
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    amendes = db.relationship('Amende', backref='casier', lazy='dynamic')
    rapports = db.relationship('Rapport', backref='casier', lazy='dynamic')
    ppas = db.relationship('PPA', backref='casier', lazy='dynamic')

class Amende(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True)
    montant = db.Column(db.Float, nullable=False)
    motif = db.Column(db.Text, nullable=False)
    lieu = db.Column(db.String(255))
    date_infraction = db.Column(db.DateTime)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    casier_id = db.Column(db.Integer, db.ForeignKey('casier.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
class Rapport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True)
    titre = db.Column(db.String(255), nullable=False)
    contenu = db.Column(db.Text, nullable=False)
    lieu = db.Column(db.String(255))
    date_incident = db.Column(db.DateTime)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    casier_id = db.Column(db.Integer, db.ForeignKey('casier.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class PPA(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True)
    heure = db.Column(db.String(10))
    personne_concernee = db.Column(db.String(100))  # Nom de la personne concernée
    test_psychologique = db.Column(db.String(20))  # attente, valide, refuse
    date_test_psy = db.Column(db.Date)  # Date du test psychologique
    matricule_agent = db.Column(db.String(50))
    modele_arme = db.Column(db.String(100))
    nombre_munitions = db.Column(db.Integer)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    casier_id = db.Column(db.Integer, db.ForeignKey('casier.id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class TimerSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True)
    date = db.Column(db.Date, default=datetime.utcnow().date)  # Date de la session
    heure_debut = db.Column(db.String(10))  # Format HH:MM
    duree_secondes = db.Column(db.Integer)  # Durée en secondes
    duree_formatee = db.Column(db.String(20))  # Format HH:MM:SS
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    agent_id = db.Column(db.Integer, db.ForeignKey('user.id'))