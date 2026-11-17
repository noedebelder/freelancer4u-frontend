import axios from "axios";
import { fail, error } from '@sveltejs/kit';
import { API_BASE_URL } from '$app/env/private';

export async function load({ url, locals }) {
    const jwt_token = locals.jwt_token;
    const currentPage = parseInt(url.searchParams.get('pageNumber') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '4');

    if (!jwt_token) {
        return {
            jobs: [],
            companies: [],
            nrOfPages: 0,
            currentPage
        };
    }

    const query = `?pageSize=${pageSize}&pageNumber=${currentPage}`;

    try {
        // Could be done in parallel with Promise.all(...)
        const jobsResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/job` + query,
            headers: { Authorization: "Bearer " + jwt_token },
        })

        let companies = [];
        if (locals.user.user_roles && locals.user.user_roles.includes('admin')) {
            // Alle Companies für das Dropdown laden (nicht auf eine Seite begrenzt)
            const companiesResponse = await axios({
                method: "get",
                url: `${API_BASE_URL}/api/company?pageNumber=1&pageSize=1000`,
                headers: { Authorization: "Bearer " + jwt_token },
            })
            companies = companiesResponse.data.content;
        }

        return {
            jobs: jobsResponse.data.content,
            companies: companies,
            nrOfPages: jobsResponse.data.totalPages || 0,
            currentPage
        };

    } catch (axiosError) {
        console.log('Error loading jobs:', axiosError);
    }
}

export const actions = {
    createJob: async ({ request, locals }) => {
        const jwt_token = locals.jwt_token;

        if (!jwt_token) {
            throw error(401, 'Authentication required');
        }

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
                    Authorization: "Bearer " + jwt_token,
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
    },

    assignToMe: async ({ request, locals }) => {
        const jwt_token = locals.jwt_token;

        if (!jwt_token) {
            throw error(401, 'Authentication required');
        }

        const data = await request.formData();
        const jobId = data.get('jobId');

        try {
            await axios({
                method: "put",
                url: `${API_BASE_URL}/api/service/me/assignjob?jobId=${jobId}`,
                headers: { Authorization: "Bearer " + jwt_token },
            });
        } catch (error) {
            console.log('Error assigning job:', error);
        }
    },

    completeMyJob: async ({ request, locals }) => {
        const jwt_token = locals.jwt_token;

        if (!jwt_token) {
            throw error(401, 'Authentication required');
        }

        const data = await request.formData();
        const jobId = data.get('jobId');

        try {
            await axios({
                method: "put",
                url: `${API_BASE_URL}/api/service/me/completejob?jobId=${jobId}`,
                headers: { Authorization: "Bearer " + jwt_token },
            });
        } catch (error) {
            console.log('Error completing job:', error);
        }
    }
}
