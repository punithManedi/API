import React from 'react';
import {
    flexRender,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import {callwebService, getTenant} from "../../utils/helpers";
import {fetchCsrfToken} from "../../services/api/fetchCsrfService";
import {ZIP_DATA_RETRIEVAL_SUCCESS} from "../../utils/toastMessages";

const TableComponent = ({ data }) => {
    const [rowSelection, setRowSelection] = React.useState({});
    const documentIds = [];

    const columns = React.useMemo(
        () => [
            {
                id: 'selection',
                header: ({ table }) => (
                    <div>
                        <input
                            type="checkbox"
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div>
                        <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    </div>
                ),
            },
            {
                accessorKey: 'title',
                header: 'Title',
            },
            {
                accessorKey: 'name',
                header: 'Name',
            },
            {
                accessorKey: 'id',
                header: 'ID',
            },
            {
                accessorKey: 'cestamp',
                header: 'Cestamp',
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
    });

    const handleSubmit = () => {
        const selectedIds = Object.keys(rowSelection)
            .filter(key => rowSelection[key])
            .map(key => data[key].id); // Map to the `id` column values

        alert(`Selected IDs: ${selectedIds.join(', ')}`);
        selectedIds.forEach(id => {
            download(id)
                .then(r => alert("Hi"));
        });
    };

    const download = async (id) => {
        const baseUrl = await getTenant();
        await getReferenceDocumentId(id, baseUrl);
    };

    const getReferenceDocumentId = async (PPId, baseUrl) => {
        await fetchCsrfToken(widget.getValue("Credentials"))
            .then(async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken
                };
                const data = {};
                await callwebService('GET', `${baseUrl}/resources/v1/modeler/documents/parentId/` + PPId + `?parentRelName=Reference%20Document&parentDirection=from`, null, headers)
                    .then(async (response) => {
                        const docId = response.output.items[0].id;
                        await getTicketToken(docId);
                    });
            });
    };

    const getTicketToken = async (docId, baseUrl) => {
        await fetchCsrfToken(widget.getValue("Credentials"))
            .then(async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken
                };
                const data = {};
                await callwebService('PUT', `${baseUrl}/resources/v1/modeler/documents/` + docId + `/files/DownloadTicket?zipFiles=true`, JSON.stringify(data), headers)
                    .then(async (response) => {
                        const ticket = response.output.items[0].ticketURL;
                        await save(ticket);
                    });
            });
    };

    const save = async (docId, baseUrl) => {
        await fetchCsrfToken(widget.getValue("Credentials"))
            .then(async (csrfToken) => {
                const headers = {
                    "Content-Type": "application/json",
                    ...csrfToken
                };
                const data = {};
                await callwebService('POST', `${baseUrl}/resources/v1/modeler/documents/` + docId + `/files/DownloadTicket?zipFiles=true`, JSON.stringify(data), headers)
                    .then(async (response) => {
                        console.log(response);
                    });
            });
    };

    return (
        <div>
            <table className="styled-table">
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} colSpan={header.colSpan}>
                                {header.isPlaceholder ? null : (
                                    <>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </>
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={handleSubmit} disabled={Object.keys(rowSelection).length === 0}>
                Download Documents
            </button>
        </div>
    );
};

export default TableComponent;
