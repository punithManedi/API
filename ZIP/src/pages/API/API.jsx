import React, { useState, useRef, useEffect } from 'react';
import { Image, Spinner } from "react-bootstrap";
import { makeDroppable, callwebService, getTenant } from "../../utils/helpers";
import { fetchCsrfToken } from "../../services/api/fetchCsrfService";
import TableComponent from "./TableComponent";
import "../../index.css";
import useToast from "../../hooks/useToast";
import { ZIP_DATA_RETRIEVAL_SUCCESS } from "../../utils/toastMessages";
import searchGif from '../../assets/search.png'; //

const API = () => {
    const dropContainerRef = useRef(null);
    const [isDropped, setIsDropped] = useState(false);
    const [jsonData, setJsonData] = useState(null);
    const [loading, setLoading] = useState(false); // 🚀 New loading state
    const { showSuccessToast } = useToast();

    useEffect(() => {
        const dropContainer = dropContainerRef.current;
        if (dropContainer) {
            makeDroppable(dropContainer, handleDrop);
        }
    }, []);

    const getRelatedItems = async (objectId) => {
        const baseUrl = await getTenant();
        await fetchCsrfToken(widget.getValue("Credentials"))
            .then(async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken
                };
                const data = {
                    "expandDepth": 1,
                    "withPath": true,
                    "type_filter_bo": ["VPMReference", "VPMRepReference"],
                    "type_filter_rel": ["VPMInstance", "VPMRepInstance"]
                };
                await callwebService('POST', `${baseUrl}/resources/v1/modeler/dseng/dseng:EngItem/` + objectId + `/expand`, JSON.stringify(data), headers)
                    .then((response) => {
                        const extractedData = response.output.member
                            .filter(item => item.title)
                            .map(item => ({
                                title: item.title,
                                name: item.name,
                                id: item.id,
                                cestamp: item.cestamp
                            }));
                        setJsonData(extractedData);
                        showSuccessToast(ZIP_DATA_RETRIEVAL_SUCCESS);
                    });
            });
    };

    const handleDrop = async (dropObject) => {
        const id = dropObject.data?.items[0]?.objectId;
        setIsDropped(true);
        setLoading(true);
        try {
            await getRelatedItems(id);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="api-container">
            {!isDropped && (
                <div
                    ref={dropContainerRef}
                    className="droppable-container mt-4"
                >
                    <Image
                        style={{ width: "90px", height: "90px" }}
                        src="https://thewhitechamaleon.github.io/testrapp/images/drag.png"
                        alt="Drag and Drop Physical Product"
                        className="search-icon"
                    />
                    <span className="drag-and-drop-text">Drag and Drop</span>
                </div>
            )}

            {loading && (
                <div className="loading-spinner">
                    <img
                        src=/images/search.png
                        alt="Loading..."
                        width="50"
                        height="50"
                    />
                </div>
            )}

            {!loading && jsonData && (
                <TableComponent data={jsonData} />
            )}
        </div>
    );
};

export default API;
