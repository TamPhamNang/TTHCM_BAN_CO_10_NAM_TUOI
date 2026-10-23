"""Drive the production transition clock without clicking a success control."""
def settle_chapter(page):
    page.evaluate("()=>{if(game.transition&&[4,7,11,14,15].includes(game.level))for(let i=0;i<24;i++)game.update(.05);game.render()}")

def advance_scene(page):
    if page.evaluate("game.state")=="failed":
        page.click("#nextBtn")
        return
    if page.evaluate("game.state")=="chapterEnd":
        page.evaluate("const el=document.getElementById('chapterDiaryContent');el.scrollTop=el.scrollHeight")
    page.evaluate("()=>{for(let i=0;i<80;i++)game.update(.05);game.render()}")
