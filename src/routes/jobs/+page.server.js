import axios from "axios";
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$app/env/private';

export async function load() {

    try {
        // Could be done in parallel with Promise.all(...)
        const jobsResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/job`,
        })
        const companiesResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/company`,
        })

        return {
            jobs: jobsResponse.data,
            companies: companiesResponse.data
        };

    } catch (axiosError) {
        console.log('Error loading companies:', axiosError);
    }
}

export const actions = {
    createJob: async ({ request }) => {

        const data = await request.formData();
        const job = {
            title: data.get('title'),
            description: data.get('description'),
            earnings: parseFloat(data.get('earnings')),
            jobType: data.get('jobType'),
            companyId: data.get('companyId')
        };

        try {
            await axios({
                method: "post",
                url: `${API_BASE_URL}/api/job`,
                headers: {
                    "Content-Type": "application/json",
                },
                data: job,
            });

            return { success: true };
        } catch (error) {
            console.log('Error creating job:', error);

            return fail(502, {
                success: false,
                error: 'Could not create job'
            });
        }
    }
}
