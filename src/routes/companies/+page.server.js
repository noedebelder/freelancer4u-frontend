import axios from "axios";
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$app/env/private';

export async function load() {

    try {
        const companiesResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/company`,
        })

        return {
            companies: companiesResponse.data
        };

    } catch (axiosError) {
        console.log('Error loading companies:', axiosError);
    }
}

export const actions = {
    createCompany: async ({ request }) => {

        const data = await request.formData();
        const company = {
            name: data.get('name'),
            email: data.get('email')
        };

        try {
            await axios({
                method: "post",
                url: `${API_BASE_URL}/api/company`,
                headers: {
                    "Content-Type": "application/json",
                },
                data: company,
            });

            return { success: true };
        } catch (error) {
            console.log('Error creating company:', error);

            return fail(502, {
                success: false,
                error: 'Could not create company'
            });
        }
    }
}
