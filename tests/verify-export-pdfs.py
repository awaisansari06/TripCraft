from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
import json,re
results=[]
for name in ['light','dark','long-trip']:
 path=f'artifacts/export-auth/qa-{name}.pdf'
 reader=PdfReader(path);texts=[p.extract_text() or '' for p in reader.pages]
 assert all(len(t.strip())>100 for t in texts),'Blank or orphan page'
 alltext=re.sub(r'\s+',' ',' '.join(texts))
 for value in ['Mumbai','Goa','Places to stay','Day 1','Day 2','Sample stay 1']:assert value in alltext,value
 assert 'TripCraft Assistant' not in alltext
 results.append({'case':name,'pages':len(texts),'allPagesHaveText':True,'allSectionsPresent':True})
 doc=pdfium.PdfDocument(path);thumbs=[]
 for i,page in enumerate(doc):
  im=page.render(scale=1.1).to_pil().convert('RGB');im.save(f'artifacts/export-auth/{name}-page-{i+1}.png');im.thumbnail((260,370))
  tile=Image.new('RGB',(280,400),'#ddd');tile.paste(im,((280-im.width)//2,20));ImageDraw.Draw(tile).text((10,4),f'{name} / {i+1}',fill='black');thumbs.append(tile)
 columns=min(5,len(thumbs));rows=(len(thumbs)+columns-1)//columns;sheet=Image.new('RGB',(columns*280,rows*400),'white')
 for i,tile in enumerate(thumbs):sheet.paste(tile,((i%columns)*280,(i//columns)*400))
 sheet.save(f'artifacts/export-auth/{name}-contact.png')
with open('artifacts/export-auth/pdf-validation.json','w') as out:json.dump(results,out,indent=2)
print(results)
