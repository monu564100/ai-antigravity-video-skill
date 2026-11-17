#!/usr/bin/env python3
"""scripts/lipsync.py - Generate lip sync visemes using Rhubarb Lip Sync or fallback.

Usage:
  python scripts/lipsync.py [project_dir]
"""

import sys
import os
import json
import shutil
import subprocess
import tempfile

def find_rhubarb():
    # Check PATH first
    rb = shutil.which('rhubarb')
    if rb:
        return rb
    # Common local paths
    local_candidates = [
        os.path.expanduser(r'~\AppData\Local\agy\bin\rhubarb.exe'),
        os.path.expanduser(r'~\.local\bin\rhubarb'),
        '/usr/local/bin/rhubarb',
        '/usr/bin/rhubarb',
    ]
    for c in local_candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    return None

def extract_dialog_text(project_dir):
    script_path = os.path.join(project_dir, 'script.json')
    if os.path.exists(script_path):
        try:
            with open(script_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            # Gather narration lines
            lines = []
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and 'text' in item:
                        lines.append(item['text'])
                    elif isinstance(item, str):
                        lines.append(item)
            elif isinstance(data, dict):
                if 'lines' in data:
                    for item in data['lines']:
                        if isinstance(item, dict) and 'text' in item:
                            lines.append(item['text'])
                        elif isinstance(item, str):
                            lines.append(item)
                elif 'text' in data:
                    lines.append(data['text'])
            if lines:
                return ' '.join(lines)
        except Exception:
            pass

    words_txt = os.path.join(project_dir, 'data', 'words.txt')
    if os.path.exists(words_txt):
        try:
            with open(words_txt, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except Exception:
            pass

    return ""

def generate_fallback_visemes(project_dir, audio_path, out_path):
    print("Generating fallback visemes from word timings / audio duration...")
    words_json = os.path.join(project_dir, 'data', 'words.json')
    cues = []
    total_dur = 15.0

    if os.path.exists(words_json):
        try:
            with open(words_json, 'r', encoding='utf-8') as f:
                words = json.load(f)
            if words:
                last_end = 0.0
                viseme_cycle = ['B', 'C', 'D', 'E', 'F']
                v_idx = 0
                for w in words:
                    s = float(w.get('start', w.get('s', 0.0)))
                    e = float(w.get('end', w.get('e', s + 0.3)))
                    if s > last_end + 0.05:
                        cues.append({'start': round(last_end, 3), 'end': round(s, 3), 'value': 'X'})
                    dur = e - s
                    half = s + dur / 2
                    cues.append({'start': round(s, 3), 'end': round(half, 3), 'value': viseme_cycle[v_idx % len(viseme_cycle)]})
                    v_idx += 1
                    cues.append({'start': round(half, 3), 'end': round(e, 3), 'value': viseme_cycle[v_idx % len(viseme_cycle)]})
                    v_idx += 1
                    last_end = e
                total_dur = max(last_end, 1.0)
        except Exception as ex:
            print("Warning: could not parse words.json:", ex)

    if not cues:
        # Default rhythmic visemes
        t = 0.0
        shapes = ['X', 'B', 'C', 'D', 'B', 'X']
        while t < total_dur:
            dur = 0.25
            cues.append({'start': round(t, 3), 'end': round(min(t + dur, total_dur), 3), 'value': shapes[int(t * 4) % len(shapes)]})
            t += dur

    payload = {
        'metadata': {
            'soundFile': audio_path,
            'duration': total_dur
        },
        'mouthCues': cues
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2)
    print(f"Fallback visemes written to {out_path} ({len(cues)} cues)")

def main():
    proj = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
    audio_path = os.path.join(proj, 'data', 'narration.wav')
    out_path = os.path.join(proj, 'data', 'visemes.json')
    os.makedirs(os.path.join(proj, 'data'), exist_ok=True)

    if not os.path.exists(audio_path):
        print(f"Note: {audio_path} not found. Generating fallback template visemes.")
        generate_fallback_visemes(proj, audio_path, out_path)
        return

    rhubarb_bin = find_rhubarb()
    if not rhubarb_bin:
        print("Rhubarb Lip Sync executable not found. Using fallback viseme generator.")
        generate_fallback_visemes(proj, audio_path, out_path)
        return

    dialog_text = extract_dialog_text(proj)
    dialog_file = None
    try:
        cmd = [rhubarb_bin, '-f', 'json', '-r', 'phonetic', audio_path, '-o', out_path]
        if dialog_text:
            with tempfile.NamedTemporaryFile('w', delete=False, suffix='.txt', encoding='utf-8') as df:
                df.write(dialog_text)
                dialog_file = df.name
            cmd.extend(['-d', dialog_file])

        print(f"Running: {' '.join(cmd)}")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and os.path.exists(out_path):
            print(f"Rhubarb lip sync complete: {out_path}")
        else:
            print("Rhubarb returned non-zero code:", res.stderr)
            generate_fallback_visemes(proj, audio_path, out_path)
    finally:
        if dialog_file and os.path.exists(dialog_file):
            try:
                os.remove(dialog_file)
            except OSError:
                pass

if __name__ == '__main__':
    main()
