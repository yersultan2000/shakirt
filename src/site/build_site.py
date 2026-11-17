import os
D=os.path.dirname(os.path.abspath(__file__))
rd=lambda f: open(os.path.join(D,f),encoding='utf-8').read()
fonts=rd('fonts.css'); css=rd('site.css'); body=rd('site.body.html')
js='"use strict";\n'+rd('engine.js')+'\n'+rd('site.js')
html=f'''<!DOCTYPE html>
<html lang="kk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Шәкірт — қатесі бар жасанды оқушыны түзету арқылы ондық бөлшектерді үйренетін веб-қосымша. Интернетсіз жұмыс істейді.">
<meta name="theme-color" content="#0B1220">
<title>Шәкірт — қатені түзетіп үйрен</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23E5432D'/%3E%3Cpath d='M8 17l5 5 11-12' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<style>
{fonts}
{css}
</style>
</head>
<body data-mode="site">
{body}
<script>
{js}
</script>
</body>
</html>
'''
open(os.path.join(D,'..','..','index.html'),'w',encoding='utf-8').write(html); import os; print(os.path.getsize(os.path.join(D,'..','..','index.html')))
