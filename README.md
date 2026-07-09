# TikTok Shop Revelado — Página de Vendas

## Como usar
1. Abra `index.html` no navegador pra visualizar, ou use a extensão "Live Server" no VSCode pra rodar com recarregamento automático.
2. Antes de publicar, edite o arquivo e troque os dois placeholders de pixel (procure por `SEU_PIXEL_ID_META` e `SEU_PIXEL_ID_TIKTOK`) pelos IDs reais.
3. O botão de checkout já aponta pra: https://pay.hotmart.com/G106648184H

## Hospedagem
Pra colocar no ar, suba esse arquivo em qualquer serviço de hospedagem estática:
- Vercel ou Netlify (gratuito, arraste e solte)
- GitHub Pages
- Hospedagem própria (Hostinger etc.)

Depois, vá em Hotmart → Produtos → Meus Produtos → [produto] → Página do Produto → Páginas externas → Configurar Página → cole a URL onde hospedou.

## Pendências
- [ ] Colar os IDs reais dos pixels (Meta e TikTok)
- [ ] Configurar o mesmo pixel dentro da Hotmart (Ferramentas → Pixel de Rastreamento) pra capturar o evento de compra no checkout
- [ ] Confirmar nome do autor (hoje está "Matheus de Alcantara A. da Silva")
