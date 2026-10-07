import json, subprocess, sys
import os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '.work')
dst = os.path.join(here, '..', '..', 'seu-barbeiro-web', 'public', 'videos')
def probe(f):
    d = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", f]))
    v = [s for s in d["streams"] if s.get("width")][0]
    return float(d["format"]["duration"]), v["width"], v["height"]
def run(*a): subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *a], check=True)
for n in ["agenda", "agendamento"]:
    mp4, jpg = f"{src}/{n}.mp4", f"{src}/{n}.jpg"
    dur, w, h = probe(mp4)
    big = w > 1000
    off = round(dur - 0.6, 3)
    run("-i", mp4, "-loop", "1", "-t", "0.7", "-i", jpg, "-filter_complex",
        f"[1]scale={w}:{h},format=yuv420p,fps=30,settb=AVTB,setsar=1[s];[0]fps=30,settb=AVTB,setsar=1[m];[m][s]xfade=transition=fade:duration=0.6:offset={off},format=yuv420p[v]",
        "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "22" if big else "23", "-profile:v", "high", "-movflags", "+faststart", "-an", f"{dst}/{n}.mp4")
    if big:
        run("-i", f"{dst}/{n}.mp4", "-vf", "scale=960:-2:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-profile:v", "high", "-movflags", "+faststart", "-an", f"{dst}/{n}-960.mp4")
        run("-i", jpg, "-vf", "scale=1280:-2", "-q:v", "4", f"{dst}/{n}.jpg")
    else:
        run("-i", jpg, "-q:v", "4", f"{dst}/{n}.jpg")
    print(n, round(dur, 1), "s", w, "x", h)
