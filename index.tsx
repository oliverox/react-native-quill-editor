import React, { useState, useEffect } from 'react';
import { Dimensions, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { readAsStringAsync } from 'expo-file-system';
import { Asset } from 'expo-asset';

type Props = {
	style?: ViewStyle;
	defaultValue?: string;
	options?: any;
	onChange?: (html: string) => void;
};

const Quill = (props: Props) => {
	const options = JSON.stringify({
		placeholder: '请输入...',
		modules: {
			toolbar: [ [ { header: [ 1, 2, false ] } ], [ 'bold', 'italic', 'underline' ], [ 'image', 'code-block' ] ]
		},
		...props.options,
		theme: 'snow'
	});
	const injectedJavaScriptBeforeContentLoaded = `window.options=${options}`;
	const injectedJavaScript = `document.querySelector('#editor').children[0].innerHTML="${props.defaultValue}"`;

	const onMessage = (e: WebViewMessageEvent) => {
		const data = JSON.parse(e.nativeEvent.data);
		if (data.type === 'onChange') {
			props.onChange(data.message);
		}
	};
	const [ html, setHTML ] = useState();
	useEffect(() => {
		const getHtml = async () => {
      console.log('getting quill.html');
			const [ { localUri } ] = await Asset.loadAsync(require('./assets/quill.html'));
      const html = await readAsStringAsync(localUri);
      console.log('quill.html loaded:');
			setHTML(html);
		};
		getHtml();
	}, []);
  return typeof(html) === 'undefined' ? (
		<WebView
			scalesPageToFit={true}
			bounces={false}
			scrollEnabled={false}
			source={{ html: '<h2>Loading...</h2>' }}
			injectedJavaScript={injectedJavaScript}
			style={{
				...props.style
			}}
		/>
	) : (
		<WebView
			scalesPageToFit={true}
			bounces={false}
			scrollEnabled={false}
			onMessage={onMessage}
			source={{ html }}
			javaScriptEnabled
			injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
			injectedJavaScript={injectedJavaScript}
			style={{
				...props.style
			}}
		/>
	);
};

Quill.defaultProps = {
	style: {},
	defaultValue: '',
	onChange: () => {},
	options: {}
};

export default Quill;
