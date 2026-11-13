from playwright.sync_api import sync_playwright
from pathlib import Path
import json
base=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
  owner=browser.new_page(viewport={'width':1360,'height':860},accept_downloads=True)
  errs=[]
  owner.on('pageerror',lambda e:errs.append(str(e)))
  owner.set_content((base/'owner/index.html').read_text(),wait_until='load',timeout=20000)
  owner.get_by_text('종결 신청 충족률').first.wait_for(timeout=20000)
  assert '87.77%' in owner.locator('#content').inner_text(),owner.locator('#content').inner_text()[:500]
  assert '610,000,000원' in owner.locator('#content').inner_text()
  owner.screenshot(path=str(base.parent/'owner_preview.png'),full_page=True)
  owner.locator('[data-nav="publish"]').click()
  owner.locator('#approve-source').check()
  owner.locator('#btn-prepare-release').click()
  assert not owner.locator('#btn-download-release').is_disabled(),owner.locator('#release-state').inner_text()
  assert '3개 시설' in owner.locator('#release-state').inner_text()
  with owner.expect_download() as dl:
   owner.locator('#btn-download-release').click()
  download=dl.value
  public_file=base.parent/'runtime-public.json';download.save_as(str(public_file))
  owner.locator('[data-nav="evidence"]').click()
  assert '오류 없음' in owner.locator('#content').inner_text()
  owner.locator('[data-nav="edit"]').click()
  assert owner.locator('#editor').input_value().startswith('{')
  assert not errs, errs
  reviewer=browser.new_page(viewport={'width':1360,'height':860})
  errors=[]
  reviewer.on('pageerror',lambda e:errors.append(str(e)))
  reviewer.set_content((base/'reviewer/index.html').read_text(),wait_until='load',timeout=20000)
  reviewer.get_by_text('재계산 결과').first.wait_for(timeout=20000)
  assert '87.77%' in reviewer.locator('#content').inner_text()
  reviewer.locator('[data-tab="review"]').click()
  assert '오류 0건' in reviewer.locator('#content').inner_text()
  reviewer.locator('[data-tab="overview"]').click()
  reviewer.screenshot(path=str(base.parent/'reviewer_preview.png'),full_page=True)
  reviewer.locator('#public-json-file').set_input_files(str(public_file))
  reviewer.locator('#status').get_by_text('가져오기 성공').wait_for(timeout=10000)
  assert not errors,errors
  print('PASS Owner demo metrics (87.77%, KRW 610M), release creation, export and Reviewer import, independent validation')
  print('Public release:',{k:len(v) if isinstance(v,list) else 'meta' for k,v in json.loads(public_file.read_text()).items()})
  browser.close()
