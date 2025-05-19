const tokenApi = 'https://production.bredasapi.com.br/overall/auth/usuario';
const productApi = 'https://production.bredasapi.com.br/erpproduto/integracaounimar';
const divVitrine = document.getElementById("vitrine")

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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            const token = data.data.access_token;
            console.log("Novo token gerado!")

            const expireDate = Date.now() + 24 * 60 * 60 * 1000; // 24h em ms, para expiração do token
            
            localStorage.setItem("token", token);
            localStorage.setItem("token_expires", expireDate);
            
            return token;
        } catch (error) {
            console.error('Erro:', error);
            return null;
        }
    }
}

async function getProduct(token) {
    try {
        const response = await fetch(productApi, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao obter produto: ${response.status}`);
        }

        let data = await response.json();
        data = data.data
        console.log(data)
        
            data.forEach(product => {
                if (product.imagens[0]) {
                    let valorVenda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.valorVenda)
                    
                    divVitrine.innerHTML += `<div class="products bg-white p-3 rounded-2xl shadow-xl border border-gray-900 overflow-hidden transition-transform hover:scale-103">
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
        console.error('Erro:', error);
    }
}

async function vitrine() {
    const token = await getToken();
    if (token) {
        await getProduct(token);
    }
}

vitrine();
