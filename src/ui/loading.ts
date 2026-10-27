export class LoadingScreen {

	private el: HTMLElement;
	private msg: HTMLElement;
	private bar: HTMLElement;

	constructor( parent: HTMLElement ) {

		this.el = document.createElement( 'div' );
		this.el.id = 'loading';
		this.el.innerHTML = `
			<div class="loading-card">
				<h1>Ali'i Drive Racer</h1>
				<p class="loading-msg">Loading Magic Sands...</p>
				<div class="loading-track"><div class="loading-bar"></div></div>
			</div>
		`;
		parent.appendChild( this.el );
		this.msg = this.el.querySelector( '.loading-msg' )!;
		this.bar = this.el.querySelector( '.loading-bar' )!;

	}

	setProgress( p: number, text?: string ): void {

		this.bar.style.width = `${ Math.round( Math.min( 1, Math.max( 0, p ) ) * 100 ) }%`;
		if ( text ) this.msg.textContent = text;

	}

	showError( html: string ): void {

		this.el.classList.add( 'error' );
		this.msg.innerHTML = html;

	}

	hide(): void {

		this.el.classList.add( 'hidden' );

	}

}
