import ForgeUI, { render, ProjectPage, Fragment, Text, useState, IssuePanel, useAction, useProductContext, Heading } from '@forge/ui';
import api, { route } from '@forge/api';
import { Form, Select, Option } from "@forge/ui";
import {Macro, Table, Head, Cell, Row } from '@forge/ui';
import { storage, startsWith } from '@forge/api';

const Issue = props => {
  return (
    // 1. Components - An element that describes part of your app’s interface. Example - Text, Heading, Table.
    <Fragment>
      <Text>Issue key: {props.issueKey}</Text>
      <Text>Issue summary: {props.summary}</Text>
    </Fragment>
  );
};

const TodoApp = (props) => (
  <Table>
    <Head>
      <Cell>
        <Text>Name</Text>
      </Cell>
      <Cell>
        <Text>Status</Text>
      </Cell>
    </Head>
    {props.data.results.map(todo => (
      <Row>
        <Cell>
          <Text>{todo.value.name}</Text>
        </Cell>
        <Cell>
          <Text>{todo.value.status}</Text>
        </Cell>
      </Row>
    ))}
  </Table>
);

const App = () => {

   const [formState, setFormState] = useState(undefined);
   const context = useProductContext();
   const projectKey = context.platformContext.projectKey;

   // 2. Hooks - Special functions that enable you to update and use the state of your app. 
   //            The state is a value that the component remembers and can be updated. Example - useState().

   const [issues] = useState(async () => {
       return await getIssues(projectKey);
   });


    const onSubmitFunction = async (formData) => {
        const attachments = await getIssueAttachment();
        console.log("Attachments Response", attachments);
        const issueData = await getIssue(formData.selectedIssue);
        setFormState(issueData)
    };

    return (
        <Fragment>
            <Heading size="medium">Generate Code Reviews for the Files in your Attachments</Heading>
            {/* 3. Event handler - functions that describe what to do when the user interacts with them. Example - onSubmit */}
            <Form onSubmit={onSubmitFunction}>
                <Select label="Select an issue" name="selectedIssue" isRequired={true}>
                {/* *** CHALLENGE 1 - Customise UI *** */}
                {/* =================== */}
                
                {/* TASK - Add the 'Option' UI element whose value will be individual issue key. */}
                {/* HINT - https://developer.atlassian.com/platform/forge/ui-kit-components/form/#select */}
                    {issues.map(issue =>
                        <Option label={issue.key} value={issue.key} />
                    )}
                {/* =================== */}
                {/* *** END OF CHALLENGE *** */}
                </Select>
            </Form>          
            <Heading size="small"></Heading>
            {formState && <Issue issueKey={formState.key} summary={formState.fields.summary} />}      
        </Fragment>
    );
};


export const run = render(
  <IssuePanel>
      <App />
  </IssuePanel>
);


const getIssue = async (issueKey) => {
  
  // *** CHALLENGE 1 - Customise UI ***
  // ===================

  // TASK - Add the API to get an issue.
  // HINT - https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get

    const issueData = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    const responseData = await issueData.json();

    console.log("getIssue data - " + JSON.stringify(responseData))

    return responseData;
}

const getIssues = async (projectKey) => {
    const returnData = new Array();
    const issueData = await api.asUser().requestJira(route`/rest/api/3/search?jql=project=${projectKey}`, {
        headers: {
            'Accept': 'application/json'
        }
    });

    const responseData = await issueData.json();

    responseData.issues.forEach(element => {
        returnData.push({key: element.key, summary: element.fields.summary});
    });

    console.log("getIssues data - " + JSON.stringify(returnData))

    return returnData;
}

const getIssueAttachments = async (issueKey) => {
    const attachmentsData = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/attachments`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log("Func Attachments", attachmentsData)

    const attachmentsResponse = await attachmentsData.json();

    console.log("Attachments Response", attachmentsResponse);

    const attachments = attachmentsResponse.map(attachment => ({
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size
    }));

    return attachments;
  };

  const getIssueAttachment = async () => {
    const attachmentsData = await api.asUser().requestJira(route`/rest/api/3/attachment/content/10000`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const attachmentsResponse = await attachmentsData.json();
    
    return attachmentsResponse;
  };