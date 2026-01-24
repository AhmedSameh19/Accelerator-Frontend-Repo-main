import axios from 'axios';
import Cookies from 'js-cookie';
import { CRM_ACCESS_TOKEN_KEY } from '../../utils/tokenKeys';

// Remove the hardcoded API key - we'll use the user's access token
const API_URL = "https://gis-api.aiesec.org/graphql";
const API_BASE_URL = 'http://localhost:5002/api';
const SERVER_URL = API_BASE_URL;
// Test data for fallback
const testData = {
  icx: [
    {
      id: "1_1",
      fullName: "John Doe",
      status: "approved",
      isRemote: "No",
      email: "john.doe@example.com",
      phone: "+1234567890",
      homeMC: "AIESEC in USA",
      homeLC: "New York",
      opportunityHomeMC: "AIESEC in USA",
      hostLC: "AIESEC in Egypt",
      opportunityLink: "https://expa.aiesec.org/opportunities/1",
      programme: "iGV",
      durationType: "6-8 weeks",
      apdDate: "2024-03-01",
      slotStartDate: "2024-04-01",
      slotEndDate: "2024-05-31",
      realizedDate: "",
      finishDate: "",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Teaching English in Egypt",
      lcAlignment: "Education",
      createdAt: "2024-02-01"
    },
    {
      id: "2_2",
      fullName: "Jane Smith",
      status: "realized",
      isRemote: "No",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      homeMC: "AIESEC in UK",
      homeLC: "London",
      opportunityHomeMC: "AIESEC in UK",
      hostLC: "AIESEC in Egypt",
      opportunityLink: "https://expa.aiesec.org/opportunities/2",
      programme: "iGV",
      durationType: "8-12 weeks",
      apdDate: "2024-02-15",
      slotStartDate: "2024-03-01",
      slotEndDate: "2024-05-31",
      realizedDate: "2024-03-01",
      finishDate: "2024-05-31",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Environmental Project in Egypt",
      lcAlignment: "Environment",
      createdAt: "2024-01-15"
    },
    {
      id: "3_3",
      fullName: "Mike Johnson",
      status: "approval_broken",
      isRemote: "No",
      email: "mike.johnson@example.com",
      phone: "+1122334455",
      homeMC: "AIESEC in Canada",
      homeLC: "Toronto",
      opportunityHomeMC: "AIESEC in Canada",
      hostLC: "AIESEC in Egypt",
      opportunityLink: "https://expa.aiesec.org/opportunities/3",
      programme: "iGV",
      durationType: "6-8 weeks",
      apdDate: "2024-02-01",
      slotStartDate: "2024-03-15",
      slotEndDate: "2024-05-15",
      realizedDate: "",
      finishDate: "",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Youth Development in Egypt",
      lcAlignment: "Youth",
      createdAt: "2024-01-01"
    }
  ],
  ogx: [
    {
      id: "4_4",
      fullName: "Sarah Wilson",
      status: "approved",
      isRemote: "No",
      email: "sarah.wilson@example.com",
      phone: "+1555666777",
      homeMC: "AIESEC in Egypt",
      homeLC: "Cairo",
      opportunityHomeMC: "AIESEC in Egypt",
      hostLC: "AIESEC in Brazil",
      opportunityLink: "https://expa.aiesec.org/opportunities/4",
      programme: "iGV",
      durationType: "6-8 weeks",
      apdDate: "2024-03-01",
      slotStartDate: "2024-04-01",
      slotEndDate: "2024-05-31",
      realizedDate: "",
      finishDate: "",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Teaching in Brazil",
      lcAlignment: "Education",
      createdAt: "2024-02-01"
    },
    {
      id: "5_5",
      fullName: "David Brown",
      status: "realized",
      isRemote: "No",
      email: "david.brown@example.com",
      phone: "+1888999000",
      homeMC: "AIESEC in Egypt",
      homeLC: "Alexandria",
      opportunityHomeMC: "AIESEC in Egypt",
      hostLC: "AIESEC in India",
      opportunityLink: "https://expa.aiesec.org/opportunities/5",
      programme: "iGV",
      durationType: "8-12 weeks",
      apdDate: "2024-02-15",
      slotStartDate: "2024-03-01",
      slotEndDate: "2024-05-31",
      realizedDate: "2024-03-01",
      finishDate: "2024-05-31",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Environmental Project in India",
      lcAlignment: "Environment",
      createdAt: "2024-01-15"
    },
    {
      id: "6_6",
      fullName: "Lisa Chen",
      status: "approval_broken",
      isRemote: "No",
      email: "lisa.chen@example.com",
      phone: "+1777888999",
      homeMC: "AIESEC in Egypt",
      homeLC: "Giza",
      opportunityHomeMC: "AIESEC in Egypt",
      hostLC: "AIESEC in Japan",
      opportunityLink: "https://expa.aiesec.org/opportunities/6",
      programme: "iGV",
      durationType: "6-8 weeks",
      apdDate: "2024-02-01",
      slotStartDate: "2024-03-15",
      slotEndDate: "2024-05-15",
      realizedDate: "",
      finishDate: "",
      remoteDate: "",
      subProduct: "Global Volunteer",
      title: "Youth Development in Japan",
      lcAlignment: "Youth",
      createdAt: "2024-01-01"
    }
  ]
};

const queryAPDs = `query{allOpportunityApplication(
    filters:{
      date_approved:{from:"01/07/2024"}
    }
    page:1
    per_page:1000
  ){
    paging{
      total_items
    }
    data{
      person{
        id
        created_at
        lc_alignment {
          keywords
        }
        full_name
        email
        contact_detail{
          phone
        }
        home_lc{
          name
        }
        home_mc{
          name
        }
      }
      opportunity{
        id
        title
        sub_product{
          name
        }
        programme{
          short_name_display
        }
        host_lc{
          name
        }
        home_mc{
          name
        }
        remote_opportunity
        project_fee
        earliest_start_date
        latest_end_date
        specifics_info{
          salary
          salary_currency{
            alphabetic_code
          }
        }
        opportunity_duration_type{
          duration_type
          salary
        }
      }
      slot{
        start_date
        end_date
      }
      status
      updated_at
      date_approved
      date_realized
      experience_end_date
      standards{
        standard_option{
          meta
        }
      }
    }
  }
}`;

const queryBreaks = `query{allOpportunityApplication(
    filters:{
      last_interaction:{from:"01/07/2022"}
      statuses:["approval_broken","realization_broken"]
    }
    page:1
    per_page:1000
  ){
    data{
      person{
        id
      }
      opportunity{
        id
      }
      status
    }
  }
}`;

async function fetchData(query) {
  try {
    const accessToken = Cookies.get(CRM_ACCESS_TOKEN_KEY);

    if (!accessToken) {
      console.error('No access token found. User must be authenticated.');
      throw new Error('Authentication required. Please log in.');
    }

    console.log('Making API request with query:', query);
    console.log('API URL:', `${API_URL}?access_token=${accessToken}`);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'access_token': accessToken
    });

    const response = await axios({
      method: 'post',
      url: `${API_URL}?access_token=${accessToken}`,
      data: { query },
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken
      }
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', response.headers);
    console.log('API response data:', response.data);

    if (!response.data || !response.data.data || !response.data.data.allOpportunityApplication) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }

    return response.data.data.allOpportunityApplication.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

function processApplicationData(data) {
  return data.map(app => {
    console.log('Processing application:', app);
    return {
      // EP ID_Opp ID
      id: `${app.person.id}_${app.opportunity?.id || ''}`,

      // Basic Information
      fullName: app.person.full_name,
      status: app.status,
      email: app.person.email,
      phone: app.person.contact_detail?.phone || "",

      // Location Information
      homeMC: app.person.home_mc.name,
      homeLC: app.person.home_lc.name,
      hostMC: app.opportunity?.home_mc?.name || "",
      hostLC: app.opportunity?.host_lc?.name || "",

      // Opportunity Information
      opportunityLink: app.opportunity ? `https://expa.aiesec.org/opportunities/${app.opportunity.id}` : "",
      programme: app.opportunity?.programme?.short_name_display || "",
      durationType: app.opportunity?.opportunity_duration_type?.duration_type || "",

      // Dates
      apdDate: app.date_approved ? app.date_approved.substring(0, 10) : app.updated_at.substring(0, 10),
      slotStartDate: app.slot?.start_date || "",
      slotEndDate: app.slot?.end_date || "",
      realizedDate: app.date_realized ? app.date_realized.substring(0, 10) : "",
      finishDate: app.experience_end_date ? app.experience_end_date.substring(0, 10) : "",
      remoteDate: app.status === "remote_realized" ? app.updated_at.substring(0, 10) : "",

      // Additional Information
      subProduct: app.opportunity?.sub_product?.name || "",
      title: app.opportunity?.title || "",
      campus: app.person.lc_alignment?.keywords || "-",
      signupDate: app.person.created_at ? app.person.created_at.substring(0, 10) : "",

      // Additional fields for display
      isRemote: app.opportunity?.remote_opportunity ? "Yes" : "No",
      lcAlignment: app.person.lc_alignment?.keywords || "-",
      createdAt: app.person.created_at
    };
  });
}

async function getRealizations() {
  try {
    console.log('Starting getRealizations...');

    // Check if user is authenticated
    const accessToken = Cookies.get(CRM_ACCESS_TOKEN_KEY);
    if (!accessToken) {
      console.error('No access token found. User must be authenticated.');
      throw new Error('Authentication required. Please log in to view realizations data.');
    }

    console.log('Access token found, proceeding with API request...');

    // Fetch all applications
    const applications = await fetchData(queryAPDs);
    console.log('Fetched applications:', applications);

    if (!applications || applications.length === 0) {
      console.log('No applications found, using test data');
      return testData;
    }

    // Process the data
    const processedData = processApplicationData(applications);
    console.log('Processed data:', processedData);

    // List of Egyptian LCs
    const egyptianLCs = [
      'ain shams university',
      'helwan',
      'alexandria',
      'aast in cairo',
      'menofia',
      'msa',
      'suez',
      'mc egypt',
      '6th october university',
      'aast alexandria',
      'guc',
      'galala',
      'tanta',
      'beni suef',
      'cairo university',
      'mansoura',
      'miu',
      'must',
      'auc',
      'zagazig',
      'new capital'
    ];

    // Separate ICX and OGX applications with detailed logging
    console.log('Filtering ICX applications...');
    const icxApplications = processedData.filter(app => {
      // Check if the hostLC is an Egyptian LC
      const isICX = app.hostLC && egyptianLCs.some(lc =>
        app.hostLC.toLowerCase().includes(lc.toLowerCase())
      );
      console.log(`Application ${app.id}:`, {
        hostLC: app.hostLC,
        isICX: isICX
      });
      return isICX;
    });
    console.log('ICX applications:', icxApplications);

    console.log('Filtering OGX applications...');
    const ogxApplications = processedData.filter(app => {
      // Check if the homeLC is an Egyptian LC
      const isOGX = app.homeLC && egyptianLCs.some(lc =>
        app.homeLC.toLowerCase().includes(lc.toLowerCase())
      );
      console.log(`Application ${app.id}:`, {
        homeLC: app.homeLC,
        isOGX: isOGX
      });
      return isOGX;
    });
    console.log('OGX applications:', ogxApplications);

    // If no applications found in either category, use test data
    if (icxApplications.length === 0 && ogxApplications.length === 0) {
      console.log('No applications found in either category, using test data');
      return testData;
    }

    // Fetch and process breaks
    const breaks = await fetchData(queryBreaks);
    console.log('Fetched breaks:', breaks);

    const breakMap = new Map(
      breaks.map(break_ => [`${break_.person.id}_${break_.opportunity.id}`, break_.status])
    );

    // Update status for broken applications
    const updateBreaks = (applications) => {
      return applications.map(app => {
        const breakStatus = breakMap.get(app.id);
        if (breakStatus) {
          return { ...app, status: breakStatus };
        }
        return app;
      });
    };

    const result = {
      icx: updateBreaks(icxApplications),
      ogx: updateBreaks(ogxApplications)
    };
    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error in getRealizations:', error);

    // If it's an authentication error, throw it to be handled by the UI
    if (error.message.includes('Authentication required')) {
      throw error;
    }

    console.log('Using test data due to error');
    return testData;
  }
}

async function getStandards(epId) {
  if (!epId) throw new Error('EP ID is required');

  try {
    const response = await axios.get(`${API_BASE_URL}/realizations/${epId}`);
    console.log('EP standards fetched successfully:', response.data.data);
    return response.data.data; // return the object with all columns
  } catch (error) {
    console.error('Error fetching EP standards:', error);
    throw error;
  }
}

async function updateStandards(epId, standards) {
  try {
    const response = await axios.put(`${API_BASE_URL}/realizations/${epId}/standard`, standards);
    return response.data;
  } catch (error) {
    console.error('Error in updateStandards:', error);
    throw error;
  }
}

async function bulkAssignLeads(data) {
  try {
    console.log("Lead IDs: ", data);
    const response = await axios.put(`${API_BASE_URL}/realizations/bulkassign`, data);
    console.log('Bulk assign response:', response.data);
    return response.data;
  }
  catch (error) {
    console.error('Error bulk assigning leads:', error);
    throw error;
  }
}

async function getLeadAssignments() {
  try {
    const response = await axios.get(`${API_BASE_URL}/realizations/assignments`);
    return response.data;
  }
  catch (error) {
    console.error('Error fetching lead assignments:', error);
    throw error;
  }
}

export { getRealizations, updateStandards, getStandards, bulkAssignLeads, getLeadAssignments };
