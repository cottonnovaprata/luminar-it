# 🔍 Guia de Teste - QR Code Local

## 🚀 **Como Testar no PC**

### **Passo 1: Acesse a página de teste do QR Code**

1. Abra o navegador do seu PC
2. Digite: `http://localhost:3000/assets/cmo1yot6t0001vxxwx0k3rcr7/qr-test`
3. Você verá um QR Code gigante na tela

### **Passo 2: Escaneie com o Celular**

**Opção A - Com Câmera (Recomendado):**
1. Abra a câmera do seu celular
2. Aponte para o QR Code na tela do PC
3. Toque no link que aparecer
4. Será redirecionado para `http://192.168.1.101:3000/assets/[id]?quick=info`

**Opção B - Copiar URL:**
1. Clique no botão "Copiar URL" na página
2. Cole no navegador do celular
3. Acesse a URL

**Opção C - Teste Direto:**
1. Clique em "Abrir URL do QR Code"
2. A navegação ocorre no PC mesmo

---

## 📱 **URL que o QR Code Aponta**

```
http://192.168.1.101:3000/assets/[ASSET_ID]?quick=info
```

**Exemplo:**
```
http://192.168.1.101:3000/assets/cmo1yot6t0001vxxwx0k3rcr7?quick=info
```

---

## 🔐 **Fluxo de Segurança Testado**

### **Cenário 1: Você está autenticado (PC)**
1. Escaneia QR Code
2. Vai direto para a página do ativo
3. ✅ Funciona!

### **Cenário 2: Você não está autenticado (Celular novo)**
1. Escaneia QR Code no celular
2. URL tenta acessar `/assets/[id]?quick=info`
3. Middleware verifica autenticação
4. ❌ Não tem token → Redireciona para `/login?redirect=/assets/[id]?quick=info`
5. Faz login no celular
6. ✅ Redireciona automaticamente para a página do ativo!

---

## 🎯 **Links para Testar**

### **No PC (localhost):**
- Dashboard: `http://localhost:3000/dashboard`
- Lista de Ativos: `http://localhost:3000/assets`
- Detalhe do Ativo: `http://localhost:3000/assets/cmo1yot6t0001vxxwx0k3rcr7`
- **Teste QR Code:** `http://localhost:3000/assets/cmo1yot6t0001vxxwx0k3rcr7/qr-test`

### **No Celular (mesmo IP):**
- Dashboard: `http://192.168.1.101:3000/dashboard`
- Lista de Ativos: `http://192.168.1.101:3000/assets`
- Detalhe do Ativo: `http://192.168.1.101:3000/assets/cmo1yot6t0001vxxwx0k3rcr7`
- QR Code URL: `http://192.168.1.101:3000/assets/cmo1yot6t0001vxxwx0k3rcr7?quick=info`

---

## ✅ **Checklist de Teste**

- [ ] Acesso via localhost no PC
- [ ] Acesso via IP 192.168.1.101 no PC
- [ ] Página de teste do QR Code carrega
- [ ] QR Code visível na tela
- [ ] Botão "Copiar URL" funciona
- [ ] Botão "Baixar QR Code" funciona
- [ ] Link "Abrir URL do QR Code" funciona
- [ ] Escaneia QR Code com celular
- [ ] Celular redireciona para página do ativo
- [ ] Informações do ativo carregam
- [ ] Quick action de manutenção funciona

---

## 🐛 **Se Algo Não Funcionar**

**Problema: Celular não consegue acessar o IP**
- ✅ Certifique-se que estão na mesma rede WiFi
- ✅ PC e celular devem estar na rede `192.168.1.x`
- ✅ Firewall pode estar bloqueando - desative temporariamente

**Problema: QR Code não carrega**
- ✅ Verifique internet (usa API externa)
- ✅ Tente F5 para recarregar
- ✅ Use a opção "Copiar URL" como alternativa

**Problema: Login não redireciona**
- ✅ Verifique se o middleware está ativo
- ✅ Cookies devem estar habilitados
- ✅ Tente em modo anônimo se persistir

---

## 🎉 **Pronto para Testar!**

Acesse agora: **http://localhost:3000/assets/cmo1yot6t0001vxxwx0k3rcr7/qr-test**
