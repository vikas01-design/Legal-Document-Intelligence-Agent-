import "dotenv/config";

const BASE_URL = "https://api.enkryptai.com";

export async function callEnkrypt(
    endpoint: string,
    payload: any
) {

    try {

        const response = await fetch(
            `${BASE_URL}${endpoint}`,
            {

                method: "POST",

                headers: {

                    "Content-Type":"application/json",

                    apikey:process.env.ENKRYPT_API_KEY!

                },

                body:JSON.stringify(payload)

            }
        );

        const data = await response.json().catch(()=>({}));

        return{

            ok:response.ok,

            status:response.status,

            data

        };

    }

    catch(error){

        console.error("Enkrypt Client Error");

        return{

            ok:false,

            status:500,

            data:{
                error:error
            }

        };

    }

}