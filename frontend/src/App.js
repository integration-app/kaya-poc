import './styles/AppBuild.css';
import {IntegrationAppClient} from '@integration-app/sdk'
import {useState} from "react";

function App() {

    const iAppClient = new IntegrationAppClient(
        {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxODNjNTY5MGZmMWU1ZWUzODhhYjg1MyIsIm5hbWUiOiJWbGFkIFVyc3VsIiwiZmllbGRzIjp7ImFwaVRva2VuIjoibXlhY2Nlc3N0b2tlbiJ9LCJpc3MiOiI5ZWZhNDk5Mi0xOTAzLTRhODYtODU0NS1kZTY0YWE3YzU5ZWUiLCJleHAiOjE2OTQxMTYyMTJ9.M3PilBtwkYfZamE_rjk50GyipUcZ3_UiHAd2nZiX6cc",
        },)


    return (
        <div className='flex place-content-center m-16'>
            <div className='container sm-auto'>
                <div className="App mockup-window border bg-base-300">
                    <div className=" px-4 py-16 bg-base-200">
                        <IntegrationsList iAppClient={iAppClient}></IntegrationsList>
                    </div>
                </div>
            </div>
        </div>
    );
}


function IntegrationsList(props) {
    let iAppClient = props.iAppClient

    // Fetch list of integrations
    const [integrations, setIntegrations] = useState(null)

    async function loadIntegartions() {
        const integrationsPage = await iAppClient.integrations.find()
        setIntegrations(integrationsPage.items)
    }

    useState(() => {
        loadIntegartions()
    }, [])


    return (
        <div className="integrations_list grid  place-content-center ">
            <table className="table  ">
                <tbody>
                {integrations &&
                integrations.map(function (integration) {
                    return (
                        <IntegrationsListItem
                            key={integration.key}
                            integration={integration}
                            iAppClient={iAppClient}
                            onUpdate={loadIntegartions}
                        />
                    )
                })}
                </tbody>
            </table>
        </div>

    )
}

function IntegrationsListItem(props) {
    let key = props.key
    let iAppClient = props.iAppClient
    let integration = props.integration

    const [flow, setFlow] = useState(null)

    async function updateFlow() {
        if (integration.connection) {
            setFlow((await iAppClient.integration(integration.key).flows.find()).items[0])
        }
    }

    useState(() => {
        updateFlow()
    }, [])

    let onUpdate = props.onUpdate
    console.log(flow && ("instance" in flow), flow)

    return (
        <tr key={key}>
            <th>
                {flow ? (<input
                    type='checkbox'
                    defaultChecked={flow.instance && flow.instance.enabled ? true : false}
                    onClick={async () => {
                        await iAppClient.integration(integration.key).flow(flow.key).patch({
                            enabled: !(flow.instance && flow.instance.enabled),
                        })
                        onUpdate()
                    }}
                    className='toggle'
                />) : (<div></div>)}
            </th>
            <td>
                <div className="avatar">
                    <div className=" w-12 h-12">
                        <img src={integration.logoUri} alt="Avatar Tailwind CSS Component"/>
                    </div>
                </div>
            </td>
            <td>
                {integration.name}
            </td>
            <th>
                {integration.connection ? (
                    <div>

                        <button className="btn btn-outline btn-sm m-2" onClick={async () => {
                            await iAppClient.integration(integration.key).disconnect()
                            onUpdate()
                        }}>Disconnect
                        </button>
                    </div>
                ) : (
                    <div>
                        <button className="btn btn-outline btn-sm m-2" onClick={async () => {
                            await iAppClient.integration(integration.key).connect()
                            onUpdate()
                        }}>Connect
                        </button>
                    </div>
                )}
            </th>
        </tr>
    )
}


export default App;
