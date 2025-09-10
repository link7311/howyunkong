function More({ text = 'MORE' }) {
	return {
		$template: '#template-more',
		text,
		mounted(el) { }
	}
}


export {
	More,
}