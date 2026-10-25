# Proxy simulado da IA (blocos 6 e 6b)

Coloque esta pasta `server/` ao lado da pasta do seu projeto e, em outro terminal, rode:

```bash
USAR_MOCK=1 node ../server/proxy.mjs      # PowerShell: $env:USAR_MOCK=1; node ../server/proxy.mjs
```

O modo simulado (`USAR_MOCK=1`) dispensa chave e internet. O proxy escuta em `http://127.0.0.1:3001`; o `vite.config.js` do projeto repassa tudo que começa com `/api` para ele (bloco 6).

Nunca coloque uma chave de API em arquivos do projeto nem em conversas.
