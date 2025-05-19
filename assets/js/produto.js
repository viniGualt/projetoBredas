const tokenApi = 'https://production.bredasapi.com.br/overall/auth/usuario';
const productApi = 'https://production.bredasapi.com.br/erpproduto/integracaounimar';

const post = {
    "Grupo": "unimar",
    "Login": "unimar",
    "Senha": "unimar"
};

async function getToken() {
    const tokenExpirado = localStorage.getItem("token_expires");
    if (tokenExpirado && Date.now() < parseInt(tokenExpirado)) {
        return localStorage.getItem("token");
    } else {
        try {
            const response = await fetch(tokenApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            const data = await response.json();
            const token = data.data.access_token;
            const expireDate = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem("token", token);
            localStorage.setItem("token_expires", expireDate);
            return token;
        } catch (error) {
            console.error('Erro ao gerar token:', error);
            return null;
        }
    }
}

async function getProdutoPorId(id, token) {
    try {
        const response = await fetch(productApi, {
            method: 'GET',
            headers: { 'Authorization': token }
        });
        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        const data = await response.json();
        const produto = data.data.find(p => p.idProduto == id);
        console.log(produto)

        if (produto) {
            const valorVenda = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
            }).format(produto.valorVenda);

            document.getElementById('detalhes-produto').innerHTML = `
                <h1>${produto.descricao}</h1>
                <img src="${produto.imagens[0]?.urlImagem || ''}" alt="${produto.descricao}" style="max-width: 300px;">
                <p>${valorVenda}</p>
                <p>${produto.detalhes || 'Sem descrição detalhada.'}</p>
            `;
        } else {
            document.getElementById('detalhes-produto').textContent = "Produto não encontrado.";
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        document.getElementById('detalhes-produto').textContent = "Erro ao buscar produto.";
    }
}

async function getProduct(id, token) {
    try {
        const response = await fetch(productApi, {
            method: 'GET',
            headers: { 'Authorization': `${token}` },
        });
        if (!response.ok) throw new Error(`Erro ao obter produto: ${response.status}`);

        const data = await response.json();
        const product = data.data.find(p => p.idProduto == id);
        console.log(product)

        if (product) {
            document.getElementById('main-img').src = product.imagens[0]?.urlImagem || '#';
            document.getElementById('main-img').alt = product.descricao || 'Imagem Principal';
            document.getElementById('thumb-1').src = product.imagens[0]?.urlImagem || '#';
            document.getElementById('thumb-2').src = product.imagens[1]?.urlImagem || '#';
            document.getElementById('thumb-3').src = product.imagens[2]?.urlImagem || '#';
            document.getElementById('product-title').textContent = product.descricao || '';
            document.getElementById('old-price').textContent = product.valorVendaDe
                ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.valorVendaDe)
                : '';
            document.getElementById('price').innerHTML = `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.valorVenda)} <span class="bg-yellow-400 text-white px-2 py-1 rounded text-sm">${product.percentualDesconto ? product.percentualDesconto + '% OFF' : ''}</span>`;
            document.getElementById('installments').textContent = product.qtdParcelas && product.valorParcela
                ? `ou ${product.qtdParcelas}x de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.valorParcela)}`
                : '';
            document.getElementById('product-reviews').textContent = product.qtdAvaliacoes ? `(${product.qtdAvaliacoes})` : '';
            document.getElementById('product-marca').textContent = product.marca || '';
            document.getElementById('product-modelo').textContent = product.modelo || '';
        }

        const vitrine = document.getElementById('vitrine');
        data.data.forEach(product => {
            if (product.imagens[0]) {
                let valorVenda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.valorVenda)
                
                vitrine.innerHTML += `<div class="products bg-white p-3 rounded-2xl shadow-xl border border-gray-900 overflow-hidden transition-transform hover:scale-103">
                    <a href="produto.html?id=${product.idProduto}" class="text-decoration-none no-underline text-black">
                        <img class="mb-3 rounded-sm w-100 product-img" src="${product.imagens[0]?.urlImagem}" alt="${product.descricao}">
                        <h6 class="font-semibold text-sm mb-2">${product.descricao}</h6>
                        <div class="flex flex-nowrap justify-arround gap-3 text-md">
                            <p class="price font-bold text-black">${valorVenda}</p>
                        </div>
                    </a>
                </div>`
                }
            })

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Decide o que carregar com base no parâmetro da URL
document.addEventListener("DOMContentLoaded", async () => {
    const token = await getToken();
    if (!token) {
        console.error("Token inválido ou não obtido.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idProduto = urlParams.get("id");

    await getProduct(idProduto, token);
});
