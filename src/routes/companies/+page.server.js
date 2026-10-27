import axios from "axios";
import { fail, error } from '@sveltejs/kit';
import { API_BASE_URL } from '$app/env/private';

export async function load({ locals }) {
    const jwt_token = locals.jwt_token;

    if (!jwt_token) {
        return {
            companies: []
        };
    }

    try {
        const companiesResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/company`,
            headers: { Authorization: "Bearer " + jwt_token },
        })

        return {
            companies: companiesResponse.data
        };

    } catch (axiosError) {
        console.log('Error loading companies:', axiosError);
    }
}

export const actions = {
    createCompany: async ({ request, locals }) => {
        const jwt_token = locals.jwt_token;

        if (!jwt_token) {
            throw error(401, 'Authentication required');
        }

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
                    Authorization: "Bearer " + jwt_token,
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
