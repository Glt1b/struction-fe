import { useMemo, useContext, useEffect, useState } from 'react';
import { getImage } from '../utils/api';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { ProjectMarkersContext } from "../contexts/ProjectMarkers";
import { MarkersContext } from "../contexts/Markers"

import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';



export default function Spreadsheet (props)  {

const { projectMarkers, setProjectMarkers } = useContext(ProjectMarkersContext);
const { markers, setMarkers } = useContext(MarkersContext);
const [ data, setData ] = useState([]);
const [ initialLoad, setInitialLoad ] = useState(true);
const [ loaded, setLoaded ] = useState(false);

const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 5, 
});



const handleExportRows = async (rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add headers
  const headers = Object.keys(rows[0].original);
  worksheet.addRow(headers);

  // Add data
  rows.forEach((row) => {
    const clonedRow = { ...row.original };

    // Create an array with values in the desired order
    const values = headers.map((header) => clonedRow[header]);

    // Add the row to the worksheet
    const addedRow = worksheet.addRow(values);

    // Iterate through cells to set cell size to fit content
    addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.alignment = { wrapText: true };

      // Adjust the column width based on the length of the text in the cell
      const columnIndex = colNumber;
      const column = worksheet.getColumn(columnIndex);
      column.width = Math.max(column.width || 0, cell.text.length + 2); // Adjust padding as needed

      // Check if the cell contains an image (replace 'photoBefore' and 'photoAfter' with your actual column names)
      const isImageColumn = ['photoBefore', 'photoAfter'].includes(headers[colNumber - 1]);

      if (isImageColumn) {
        const base64Data = cell.value;

        if (base64Data) {
          // Set fixed width and height for the photo
          const imageWidth = 200;
          const imageHeight = 200;

          const imageId = workbook.addImage({
            base64: base64Data,
            extension: 'png', // Change the extension based on your image format
          });

          // Set the image position to the correct column and row
          const imageColumnIndex = headers.indexOf(headers[colNumber - 1]);
          const imagePosition = {
            tl: { col: imageColumnIndex, row: addedRow.number - 1 },
            br: { col: imageColumnIndex + 1, row: addedRow.number },
          };

          worksheet.addImage(imageId, {
            ...imagePosition,
            editAs: 'undefined',
            width: imageWidth,
            height: imageHeight,
          });

          // Set row height to fit the image
          addedRow.height = imageHeight;

          // Clear the cell content since the image is inserted
          cell.value = undefined;
        }
      }
    });
  });

  // Create a blob from the workbook
  const blob = await workbook.xlsx.writeBuffer();

  // Save the blob as a file
  saveAs(new Blob([blob]), 'exported-data.xlsx');
};



  useEffect(() => {
    if(1 === 1){ // condition to be deleted
    setLoaded(false);

    console.log('fetching data')

    //const displayedMarkers = projectMarkers.slice(pagination.pageIndex*pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize )

    let d = [];

    Promise.all(
      markers.map(async (m) => {     // markers / projectMarkers
        let photoBefore;
        let photoAfter;

        // Use Promise.all to wait for both getImage promises to resolve
        await Promise.all([
          getImage(m.photos[0]).then((result) => {
            photoBefore = result;
          })
          .catch(() => {
            photoBefore = ''
          }),
          getImage(m.photos[m.photos.length - 1]).then((result) => {
            photoAfter = result;
          })
          .catch(() => {
            photoAfter = ''
          }),
        ]);


        let materialsStrings = '';
        let servicesString = '';

         // Extract materials 

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

        // calculate price

        let price = 'No enough data to calculate the price'

        function checkKeysRepresentation(materialsUsed, prices) {
          // Gather all keys from materialsUsed arrays objects
          let allKeys = new Set();
      
          materialsUsed.forEach(material => {
              Object.keys(material).forEach(key => {
                  allKeys.add(key);
              });
          });
      
          // Check if all keys have representation in prices object
          for (let key of allKeys) {
              if (!prices.hasOwnProperty(key)) {
                  return ;
              }
          }
          price = ''
      }

      checkKeysRepresentation(m.materialsUsed, props.prices);

      let ar;
      function calculateAreas(materialsUsed) {
        let areas = {};
    
        materialsUsed.forEach(material => {
            let key = Object.keys(material)[0];
            let dimensions = material[key];
    
            let area;
    
            if (dimensions[2] !== '') {  // If diameter is different than 0, calculate circle area
                let radius = dimensions[2] / 2;
                area = Math.PI * Math.pow(radius, 2);
            } else {  // If diameter is 0, calculate rectangle area
                area = dimensions[0] * dimensions[1];
            }
    
            // Multiply result by quantity and convert from mm^2 to m^2
            areas[key] = area * dimensions[3] / 1000000;
        });
    
        ar = areas;
    }

    calculateAreas(m.materialsUsed);

    let summaryMaterial = 0;

    console.log(ar)

    const areasKeys = Object.keys(ar);

    for(let a of areasKeys){
      console.log(ar[a])
      console.log(isNaN(ar[a]))
      console.log(isNaN(props.prices[a]))
      summaryMaterial += ar[a] * props.prices[a];
    }

    summaryMaterial = summaryMaterial * 1.2;
    console.log(summaryMaterial)
    
    const labour = m.lock * 0.42 * 1.2;
    const costs = labour + summaryMaterial;
    const p = props.commission / 100;
    const commission = p * costs;
    price = commission + costs;


      

        // Create object
        let obj = {
          number: m.number,
          clientID: m.doorCondition,
          location: m.location,
          status: m.status,
          fR: m.fR,
          services: servicesString,
          scope: m.frameCondition,
          photoBefore: photoBefore,
          materials: materialsStrings,
          photoAfter: photoAfter,
          completedBy: m.completedBy,
          completedOn: m.doorFinish,
          comment: m.comment,
          price: price,
          labour: labour,
          summaryMaterial: summaryMaterial,
          commission: commission
        };

        d.push(obj);

        // set data if extracting completed
        if (d.length === markers.length) {
          setData(d);
          setLoaded(true);
        }
      })
    );
  }
}, [pagination.pageIndex, pagination.pageSize, markers, initialLoad]);


  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: 'number', 
        header: 'Number',
        size: 150,
      },
      {
        accessorKey: 'clientID', 
        header: 'Client ID',
        size: 150,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        enableColumnPinning: false,
        size: 150,
      },
      {
        accessorKey: 'status', 
        header: 'Status',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'services', 
        header: 'Services',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'photoBefore', 
        header: 'Photo Before',
        enableColumnPinning: false,
        size: 200,
        Cell: ({row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <img
              alt="photoBefore"
              height={200}
              src={row.original.photoBefore}
              loading="lazy"
            />
          </Box>
        )
      },
      {
        accessorKey: 'scope', 
        header: 'Scope of Work',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'fR', 
        header: 'Fire Rating',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'materials', 
        header: 'Materials',
        enableColumnPinning: false,
        size: 200,
      },

      {
        accessorKey: 'photoAfter', 
        header: 'Photo After',
        enableColumnPinning: false,
        enableColumnOrdering: false,
        size: 200,
        Cell: ({row}) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <img
              alt="photoBefore"
              height={200}
              src={row.original.photoAfter}
              loading="lazy"
            />
          </Box>
        )
      },
      {
        accessorKey: 'completedBy', 
        header: 'Completed By',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'completedOn', 
        header: 'Completed On',
        filterFn: 'between',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'price', 
        header: 'Price',
        filterFn: 'between',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'labour', 
        header: 'Labour',
        filterFn: 'between',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'summaryMaterial', 
        header: 'Material Price',
        filterFn: 'between',
        enableColumnPinning: false,
        size: 200,
      },
      {
        accessorKey: 'commission', 
        header: 'Commission',
        filterFn: 'between',
        enableColumnPinning: false,
        size: 200,
      },
     
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data, 

    enableRowSelection: true,
    enableStickyHeader: true,
    enableColumnPinning: true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    onPaginationChange: setPagination, 
    state: { pagination }, 
    initialState: {
      columnPinning: { left: ['number'] },
    },
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

  return (
    <div>
      { loaded ? (<MaterialReactTable table={table} />) : (<h1>Loading...</h1>)}
    </div>
  )
};


