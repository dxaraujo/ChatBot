import React from 'react'
import { Modal, StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Platform } from 'react-native'
import ActionSheet from 'react-native-action-sheet'
import CameraRollPicker from 'react-native-camera-roll-picker'

export default class CustomActions extends React.Component {
	constructor(props) {
		super(props)
		this._images = []
		this.state = {
			modalVisible: false,
		}
		this.onActionsPress = this.onActionsPress.bind(this)
		this.selectImages = this.selectImages.bind(this)
	}

	setImages(images) {
		this._images = images
	}

	getImages() {
		return this._images
	}

	setModalVisible(visible = false) {
		this.setState({ modalVisible: visible })
	}

	onActionsPress() {
		const options = ['Choose From Library', 'Send Location', 'Cancel']
		const cancelButtonIndex = options.length - 1
		ActionSheet.showActionSheetWithOptions({ options, cancelButtonIndex, }, (buttonIndex) => {
			switch (buttonIndex) {
				case 0:
					if (Platform.OS ==  'android') {
						this.requestExternalStoreageRead()
					} else {
						this.setModalVisible(true)
					}
					break
				case 1:
					navigator.geolocation.getCurrentPosition(position => {
						this.props.onSend({
							location: {
								latitude: position.coords.latitude,
								longitude: position.coords.longitude,
							},
						})
					}, (error) => alert(error.message), { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
					)
					break
				default:
			}
		})
	}

	requestExternalStoreageRead = () => {
		const options = { title: 'Cool App ...', message: 'App needs access to external storage' }
		PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, options).then(granted => {
			if (granted == PermissionsAndroid.RESULTS.GRANTED) {
				this.setModalVisible(true)
			}
		}).catch(err => {})
	}

	selectImages(selectedImages, currentImage) {
		this.setImages(selectedImages)
		this.props.onSend({
			image: currentImage.uri
		})
		this.setModalVisible()
	}

	renderIcon() {
		if (this.props.icon) {
			return this.props.icon()
		}
		return (
			<View style={[styles.wrapper, this.props.wrapperStyle]}>
				<Text style={[styles.iconText, this.props.iconTextStyle]}>
					+
				</Text>
			</View>
		)
	}

	render() {
		return (
			<TouchableOpacity style={[styles.container, this.props.containerStyle]} onPress={this.onActionsPress}>
				<Modal animationType={'slide'} transparent={false} visible={this.state.modalVisible} onRequestClose={() => {
					this.setModalVisible(false)
				}}>
					<CameraRollPicker
						maximum={1}
						imagesPerRow={4}
						callback={this.selectImages}
						selectSingleItem={true}

					/>
				</Modal>
				{this.renderIcon()}
			</TouchableOpacity>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		width: 26,
		height: 26,
		marginLeft: 10,
		marginBottom: 10,
	},
	wrapper: {
		borderRadius: 13,
		borderColor: '#b2b2b2',
		borderWidth: 2,
		flex: 1,
	},
	iconText: {
		color: '#b2b2b2',
		fontWeight: 'bold',
		fontSize: 16,
		backgroundColor: 'transparent',
		textAlign: 'center',
	},
})