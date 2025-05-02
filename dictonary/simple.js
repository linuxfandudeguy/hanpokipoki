const fs = require('fs');
const readline = require('readline');

// Function to split the large CSV file into smaller chunks
function splitCsvIntoChunks(inputCsv, linesPerChunk = 9000) {
  const stream = fs.createReadStream(inputCsv, 'utf8');
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let chunkCounter = 0;
  let lineCounter = 0;
  let chunkData = [];
  let headersWritten = false;

  rl.on('line', (line) => {
    // Write headers to the first chunk only
    if (lineCounter === 0) {
      headersWritten = true;
    }

    chunkData.push(line);
    lineCounter++;

    // When we reach the specified lines per chunk, write the chunk and reset
    if (lineCounter >= linesPerChunk) {
      const chunkFilename = `${inputCsv}_chunk_${chunkCounter}.csv`;
      writeChunkToFile(chunkFilename, chunkData, headersWritten);
      chunkData = []; // Reset the chunk data
      lineCounter = 0; // Reset line counter
      chunkCounter++;
      headersWritten = false; // Ensure headers are only written once
    }
  });

  rl.on('close', () => {
    // Write any remaining lines in the last chunk
    if (chunkData.length > 0) {
      const chunkFilename = `${inputCsv}_chunk_${chunkCounter}.csv`;
      writeChunkToFile(chunkFilename, chunkData, headersWritten);
    }
    console.log(`CSV file has been split into ${chunkCounter + 1} chunks.`);
  });
}

// Function to write a chunk of data to a new file
function writeChunkToFile(chunkFilename, data, headersWritten) {
  // If headers are not written yet, write them to the first chunk
  if (!headersWritten) {
    const header = 'word,phonetic,definition,translation,pos,collins,oxford,tag,bnc,frq,exchange,detail,audio';
    data.unshift(header); // Add headers to the first chunk
  }

  fs.writeFileSync(chunkFilename, data.join('\n') + '\n');
}

// Example usage

const inputCsvFilePath = 'data.csv'; // Your large CSV file
const chunkLines = 9000; // Adjust based on the size of your CSV
splitCsvIntoChunks(inputCsvFilePath, chunkLines);
