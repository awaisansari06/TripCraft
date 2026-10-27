"""Grade the existing hero frames only; no generated or redrawn scenery.
Run with the bundled Python (numpy/Pillow) and ffmpeg on PATH.
Sky is identified from the original paper color; closed engraved outlines
protect pale landmark interiors. Clay, foliage and stone have separate grades.
"""
from pathlib import Path
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
W, H = 1920, 1080

def grade(image):
    rgb = np.asarray(image, dtype=np.float32) / 255
    r,g,b = rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    lum = .2126*r + .7152*g + .0722*b
    # Original paper is pale; fill the sky from its upper boundary while
    # respecting continuous architectural outlines in the original frame.
    if not hasattr(grade, 'sky_mask'):
        paper = (lum > .70) & ((r-b) < .26)
        barriers = Image.fromarray(np.uint8(~paper)*255).filter(ImageFilter.MaxFilter(3))
        mask = barriers.copy()
        ImageDraw.floodfill(mask, (W//2, 0), 128, thresh=0)
        sky = np.asarray(mask) == 128
        # Clouds are original upper-sky ink, not separate fabricated cloud shapes.
        sky[:int(H*.50)] = True
        # Remove isolated paper flecks from the foreground matte, then protect
        # the pale limestone interiors whose engraved contours contain open gaps.
        foreground = Image.fromarray(np.uint8(~sky)*255).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
        draw = ImageDraw.Draw(foreground)
        stone_outline = [(873,657),(879,561),(885,561),(885,537),(890,537),(893,521),(898,537),(904,537),(904,560),(910,560),(911,592),(918,592),(918,563),(924,552),(931,563),(931,579),(941,579),(946,567),(956,567),(956,550),(975,550),(975,530),(980,512),(995,499),(1013,491),(1015,474),(1018,491),(1037,500),(1052,515),(1056,539),(1052,550),(1070,550),(1070,565),(1080,565),(1085,578),(1095,578),(1095,565),(1101,556),(1107,565),(1107,590),(1115,590),(1115,641)]
        christ_outline = [(1073,465),(1085,462),(1100,466),(1132,465),(1133,446),(1140,438),(1148,439),(1154,446),(1155,465),(1194,465),(1205,462),(1216,465),(1213,471),(1190,476),(1184,486),(1169,486),(1168,597),(1183,601),(1183,621),(1120,638),(1118,600),(1123,596),(1123,487),(1113,484),(1104,477),(1080,474)]
        for polygon in [stone_outline, christ_outline]:
            draw.polygon([(int(x*W/1280),int(y*H/720)) for x,y in polygon],fill=255)
        sky_mask = 1-np.asarray(foreground.filter(ImageFilter.GaussianBlur(.65)),dtype=np.float32)/255
        grade.sky_mask = sky_mask
    sky_mask = grade.sky_mask
    y = np.linspace(0,1,H,dtype=np.float32)[:,None]
    sky_base = np.stack([24+11*y,33+7*y,43-2*y],axis=-1)
    paper_texture = np.clip((lum-.91)*22,-9,3)[:,:,None]
    # Desaturated sandstone engraved cloud lines, retaining exactly both originals.
    cloud_ink = np.clip((.88-lum)/.22,0,1) * (y < .48)
    cloud_ink *= np.clip((r-b-.04)/.12,0,1)
    night_sky = sky_base + paper_texture + cloud_ink[:,:,None]*np.array([65,61,50])
    # Preserve local value differences and every ink stroke in the landmarks.
    neutral = rgb*255*.48 + np.array([9,13,16])
    clay = np.clip((r-g-.065)/.19,0,1)[:,:,None]
    olive = (np.clip((g-b-.025)/.12,0,1)*(1-np.squeeze(clay)))[:,:,None]
    stone = np.clip((lum-.48)/.35,0,1)[:,:,None]*(1-clay)*(1-olive*.55)
    land = neutral + clay*np.array([21,3,-4]) + olive*np.array([-8,5,0]) + stone*np.array([18,12,3])
    out = land*(1-sky_mask[:,:,None]) + night_sky*sky_mask[:,:,None]
    return Image.fromarray(np.uint8(np.clip(out,0,255)))

if __name__ == '__main__':
    (ROOT/'artifacts/hero-review').mkdir(parents=True, exist_ok=True)
    first_frame = subprocess.check_output(['ffmpeg','-v','error','-i',str(ROOT/'public/hero/day.mp4'),'-frames:v','1','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'])
    first = Image.frombytes('RGB',(W,H),first_frame)
    grade(first).save(ROOT/'artifacts/hero-review/night-preview.png')
    if '--preview' in sys.argv: sys.exit(0)
    reader = subprocess.Popen(['ffmpeg','-v','error','-i',str(ROOT/'public/hero/day.mp4'),'-an','-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    writer = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','24','-i','-','-an','-c:v','libx264','-crf','20','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'public/hero/night.mp4')],stdin=subprocess.PIPE)
    frames=0
    while True:
        data=reader.stdout.read(W*H*3)
        if len(data)!=W*H*3: break
        frame=grade(Image.frombytes('RGB',(W,H),data))
        writer.stdin.write(frame.tobytes())
        if frames==0: frame.save(ROOT/'public/hero/night-poster.webp',quality=90)
        frames+=1
        if frames%48==0: print(f'Graded {frames} frames',flush=True)
    writer.stdin.close()
    if reader.wait() or writer.wait(): raise RuntimeError('Video encoding failed')
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'public/hero/night.mp4'),'-an','-c:v','libvpx-vp9','-b:v','0','-crf','30','-deadline','realtime','-cpu-used','6','-row-mt','1',str(ROOT/'public/hero/night.webm')],check=True)
    print(f'Finished {frames} aligned frames in MP4 and WebM',flush=True)
