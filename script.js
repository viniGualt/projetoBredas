const tokenApi = 'https://production.bredasapi.com.br/overall/auth/usuario';
const productApi = 'https://production.bredasapi.com.br/erpproduto/integracaounimar';

const post = {
    "Grupo": "unimar",
    "Login": "unimar",
    "Senha": "unimar"
};

async function getToken() {
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
        console.log('Token adquirido');

        return token;
    } catch (error) {
        console.error('Erro:', error);
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

        const data = await response.json();
        console.log(data);
        console.log(data.data[0])

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
