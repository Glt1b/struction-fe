import { useMemo, useContext, useEffect, useState } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv'; 

import { ProjectMarkersContext } from "../contexts/ProjectMarkers";

const csvConfig = mkConfig({
  fieldSeparator: ',',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});


export default function Spreadsheet ()  {

const { projectMarkers, setProjectMarkers } = useContext(ProjectMarkersContext);
const [ data, setData ] = useState([]);
const [ initialLoad, setInitialLoad ] = useState(true);

console.log(projectMarkers);

const handleExportRows = (rows) => {
  const rowData = rows.map((row) => row.original);
  const csv = generateCsv(csvConfig)(rowData);
  download(csvConfig)(csv);
};

const handleExportData = () => {
  const csv = generateCsv(csvConfig)(data);
  download(csvConfig)(csv);
};

  useEffect(() => {
    if(initialLoad){

    setInitialLoad(false);

    let d = [];
    for( let m of projectMarkers ){

      let materialsStrings = '';
      let servicesString = '';

        // extract materials

        m.materialsUsed.forEach(o => {
          const key = Object.keys(o)[0];
          const [width, height, diameter, quantity] = o[key];
          const str = `${key}: ` +
            (width !== "" ? `width: ${width}, ` : '') +
            (height !== "" ? `height: ${height}, ` : '') +
            (diameter !== "" ? `diameter: ${diameter}, ` : '') +
            (quantity !== "" ? `quantity: ${quantity}, ` : '') +
            ((width !== "" && height !== "" && quantity !== "0") ? `(${height * width * quantity / 1000000} m2)` : '');
    
          materialsStrings += str + '\n';
        });

        // extract services

        let tempCounter = {};

        m.service.forEach(ele => {
              if (tempCounter[ele]) {
                  tempCounter[ele] += 1;
              } else {
                  tempCounter[ele] = 1;
              }
          });
    
        const keys = Object.keys(tempCounter);
    
        keys.forEach(ele => {
          servicesString += ele + ': ' + tempCounter[ele].toString() + ', \n ';
        })

        // create object

        let obj = {
            number: m.number,
            location: m.location,
            status: m.status,
            fR: m.fR,
            materials: materialsStrings,
            services: servicesString,
            completedBy: m.completedBy,
        };
    d.push(obj);

    // set data if extracting completed

    if(d.length === projectMarkers.length){
        setData(d);
    }
    }
}
  })

  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'number', //access nested data with dot notation
        header: 'Number',
        size: 150,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 150,
      },
      {
        accessorKey: 'status', //normal accessorKey
        header: 'Status',
        size: 200,
      },
      {
        accessorKey: 'fR', //normal accessorKey
        header: 'Fire Rating',
        size: 200,
      },
      {
        accessorKey: 'materials', //normal accessorKey
        header: 'Materials',
        size: 200,
      },
      {
        accessorKey: 'services', //normal accessorKey
        header: 'Services',
        size: 200,
      },
      {
        accessorKey: 'completedBy', //normal accessorKey
        header: 'Completed By',
        size: 200,
      },
     
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)

    enableRowSelection: true,
    
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          //export all rows, including from the next page, (still respects filtering and sorting)
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};


