// import React from 'react';
// import { SafeAreaView, StyleSheet } from 'react-native';
// import Pdf from 'react-native-pdf';

// const PDFViewer = () => {
//   const source = { uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf', cache: true };
//   // const source = require('./assets/sample.pdf');  // If the PDF is a local asset
//   // const source = {base64: 'JVBERi0xLjMKJcKlwr...'}; // Example base64 string

//   return (
//     <SafeAreaView style={styles.container}>
//       <Pdf
//         source={source}
//         style={styles.pdf}
//         onError={(error) => {
//           console.error(error);
//         }}
//         onLoadComplete={(numberOfPages, filePath) => {
//           console.log(`Number of pages: ${numberOfPages}`);
//         }}
//         onPageChanged={(page, numberOfPages) => {
//           console.log(`Current page: ${page}`);
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   pdf: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
// });

// export default PDFViewer;