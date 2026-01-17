from flask import Flask, render_template, jsonify, request
import random
import json
import os
from datetime import datetime

app = Flask(__name__)

# OSRS Bosses with their kill count ranges
BOSSES = {
    "Zulrah": (20, 50),
    "Corporeal Beast": (20, 50),
    "Giant Mole": (20, 50),
    "Kalphite Queen": (15, 30),
    "King Black Dragon": (20, 50),
    "Sarachnis": (20, 50),
    "Phosani's Nightmare": (20, 50),
    "Chambers of Xeric": (1, 3),
    "Theatre of Blood": (1, 3),
    "Leviathan": (20, 50),
    "Duke": (20, 50),
    "Vardorvis": (20, 50),
    "The Whisperer": (20, 50),
    "Yama": (10,20),
    "Doom": (5, 10)
}

CONFIG_FILE = "boss_config.json"
LOG_FILE = "boss_log.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {boss: True for boss in BOSSES.keys()}

def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def load_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as f:
            return json.load(f)
    return []

def save_log(log):
    with open(LOG_FILE, 'w') as f:
        json.dump(log, f, indent=2)

# Route for main page
@app.route('/')
def home():
    return render_template('index.html')

# API endpoint to get all bosses and their enabled status
@app.route('/api/bosses')
def get_bosses():
    config = load_config()
    bosses_data = []
    for boss, (min_k, max_k) in BOSSES.items():
        bosses_data.append({
            'name': boss,
            'enabled': config.get(boss, True),
            'min_kills': min_k,
            'max_kills': max_k
        })
    return jsonify(bosses_data)

# API endpoint to toggle a boss
@app.route('/api/toggle/<boss_name>', methods=['POST'])
def toggle_boss(boss_name):
    config = load_config()
    if boss_name in BOSSES:
        config[boss_name] = not config.get(boss_name, True)
        save_config(config)
        return jsonify({'success': True, 'enabled': config[boss_name]})
    return jsonify({'success': False}), 404

# API endpoint to generate challenge
@app.route('/api/generate')
def generate_challenge():
    config = load_config()
    enabled_bosses = [boss for boss, enabled in config.items() if enabled]
    
    if not enabled_bosses:
        return jsonify({'error': 'No bosses enabled'}), 400
    
    boss = random.choice(enabled_bosses)
    min_kills, max_kills = BOSSES[boss]
    kill_count = random.randint(min_kills, max_kills)
    
    return jsonify({'boss': boss, 'kills': kill_count})

# API endpoint to complete challenge
@app.route('/api/complete', methods=['POST'])
def complete_challenge():
    data = request.json
    boss = data.get('boss')
    kills = data.get('kills')
    
    log = load_log()
    log.append({
        'boss': boss,
        'kills': kills,
        'completed': datetime.now().isoformat()
    })
    save_log(log)
    
    return jsonify({'success': True})

# API endpoint to get history
@app.route('/api/history')
def get_history():
    log = load_log()
    return jsonify(log[-20:])  # Last 20 entries

if __name__ == '__main__':
    app.run(debug=True)

'''
TO DO

Add a delete button next to history items
 - You'll need to:
    Add a button in the HTML/JavaScript where history displays
    Create a new Flask route to handle deletion
    Pass the entry info to Flask
    Remove it from boss_log.json
    Refresh the history display

TURN OFF DEBUG MODE

'''