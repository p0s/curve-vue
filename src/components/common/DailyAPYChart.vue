<template>
	<fieldset>
		<legend>Daily APY % <span class='tooltip'>[?]<span class='tooltiptext long'>Pool APY % + Lending APY % (on annual basis)</span></span></legend>
		<highcharts :constructor-type="'stockChart'" :options="chartdata" ref='highcharts'></highcharts>
    	<p v-show='volume && volume[0] != -1'>
    		<span>Daily USD trading volume:</span> 
    		<span :class="{'loading line': !volume}">
    			<span v-show='volume && volume[0] != -1'> {{ (volume && volume[0] || 0) | formatNumber(0) }}$</span>	
    		</span>
    		<div v-show="['tbtc', 'ren'].includes(pool)">
	    		<span>Daily BTC trading volume:</span>
	    		<span>
	    			<span v-show='volume && volume[1] != -1'> {{ (volume && volume[1] || 0) | formatNumber(8) }} BTC </span>
	    		</span>
    		</div>
    	</p>
	</fieldset>
</template>

<script>
	import Highcharts from 'highcharts'
	import HC_exporting from 'highcharts/modules/exporting';
	import HC_exporting_data from 'highcharts/modules/export-data';
	HC_exporting(Highcharts);
	HC_exporting_data(Highcharts)

	import {Chart} from 'highcharts-vue'
	import stockInit from 'highcharts/modules/stock'

	import * as helpers from '../../utils/helpers'
	import abis from '@/allabis'
	import * as volumeStore from '@/components/common/volumeStore'

	stockInit(Highcharts)

	Highcharts.setOptions({
		lang: {
			loading: '',
		}
	})

	export default {
		props: {
			data: Array,
			volume: {
				type: Array,
			},
			pool: String,
		},
		components: {
			highcharts: Chart,
		},
		data(){
			return {
			chartdata: {
				chart: {
					panning: true,
					zoomType: 'x',
			        panKey: 'ctrl',
			        height: 600,
				},
                rangeSelector: {
		            selected: 1
		        },
		        exporting: {
					buttons: {
						contextButton: {
							menuItems: ["printChart",
					                    "separator",
					                    "downloadPNG",
					                    "downloadJPEG",
					                    "downloadPDF",
					                    "downloadSVG",
					                    "separator",
					                    "downloadCSV",
					                    "downloadXLS",
					                    //"viewData",
					                    "openInCloud"]
						}
					}
				},
	            yAxis: [
		            {
		            	id: 'apyAxis',
		            	opposite: false,
		            	type: ((self) => self.pool == 'ren' ? 'linear' : 'logarithmic')(this),
	        			title: {
	        				text: 'Daily APY [%]',
	        				style: {
	        					color: 'black'
	        				},
	        				margin: 10,
	        			},
		            	labels: {
		            		align: 'right',
		            		x: -30,
		            		formatter() {
		            			return (Math.floor(this.value * 100) / 100).toFixed(2);
		            		},
			            	style: {
			            		color: 'black'
			            	},
		            	},
		            	tickPixelInterval: 10,
		            	height: '60%',
		            },
		            {
		            	id: 'volumeAxis',
		            	//type: 'logarithmic',
		            	opposite: false,
		            	title: {
		            		text: 'Trading Volume',
		            		style: {
		            			color: 'black'
		            		},
		            		margin: 10,
		            	},
		            	labels: {
		            		style: {
		            			color: 'black',
		            		},
		            		align: 'right',
		            		x: -30,
		            	},
		            	top: '65%',
		            	height: '35%',
			            offset: 0,
		            }
	            ],
	            xAxis: {
	            	labels: {
		            	style: {
		            		color: 'black'
		            	}
	            	}
	            },
		        series: [/*{
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: [],
		        	color: '#0b0a57'
		        }*/],
		        tooltip: {
		        	split: true,
	                valueDecimals: 3,
	                pointFormatter: (function(self) { 
	                	return function() {
	                		let value = Math.floor(this.y * 100) / 100 + '%';
		                	if(this.series.name == 'Daily APY') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
		                	if(this.series.name == 'Lending APY') return `<span style="color:${this.color}">●</span> ${this.series.name}: <b>${value}</b><br/>`
		                	if(this.series.name === 'Trading Volume') {
		                		let val = this.y.toFixed(2)
		                		if(['tbtc', 'ren'].includes(self.pool)) val = this.y.toFixed(8)
		                		return `<span style="color:${this.color}">●</span> ${this.series.name} : <b>${val}</b><br/>`
		                	}
		                }
		        	})(this),
	            },
	            legend: {
	            	enabled: true,
	            },
			},
			chart: null,
		}
		},
		computed: {
			volumeData() {
				if(['tbtc', 'ren'].includes(this.pool)) return helpers.formatNumber(this.volume, 8)
				return helpers.formatNumber(this.volume, 0)
			}
		},
		watch: {
			'data.length'(val) {
				this.mounted()
			}
		},
		mounted() {	
			this.chart = this.$refs.highcharts.chart;
	        this.chart.showLoading();
		},
		methods: {
			loaded() {
				this.loading = false;
			},
			async mounted() {
				while(this.chart.series.length) {
					this.chart.series[0].remove()
				}
		        let chartData = [];
		        for(let i = 1; i < this.data.length; i++) {
		        	var el = this.data[i];
		        	let daylen = el.timestamp - this.data[i-1].timestamp
		        	let profit = ((el.virtual_price / 1e18) / (this.data[i-1].virtual_price / 1e18)) ** (365 * 86400 / daylen) - 1
		        	chartData.push([
		        		el.timestamp * 1000,
		        		profit * 100,
		        	])
		        }

		        this.chart.setSize(undefined, 600)
		        this.chart.addSeries({
		        	name: 'Daily APY',
		        	lineWidth: 2,
		        	data: chartData,
		        	color: '#0b0a57'
		        }, false, false)

		        if(['susd'].includes(this.pool)) {
		        	this.chart.yAxis[0].update({
		        		type: 'linear'
		        	})
		        }

		        await volumeStore.getDailyVolume(this.pool, false, 1440)

		        let volumeSeries = volumeStore.state.allVolume[this.pool == 'susdv2' ? 'susd' : this.pool]

		        this.chart.addSeries({
		        	type: 'column',
		        	name: 'Trading Volume',
		        	data: volumeSeries,
		        	color: '#0b0a57',
		        	yAxis: 'volumeAxis',
		        }, false, false)

		        this.chart.redraw(false)

		        let lendingrates;
		        let lendingAxis = 'apyAxis'
		        if(!['susdv2', 'tbtc', 'ren'].includes(this.pool))    	
	    			lendingrates = await volumeStore.getLendingAPY(this.pool, false, 1440)
		        else {
		        	lendingrates = volumeSeries.map(data => [data[0], 0])
		        	lendingAxis = 'lendingAxis'
		        	this.chart.addAxis({
		            	id: 'lendingAxis',
		            	opposite: false,
		            	type: 'linear',
		            	title: {
		            		text: 'Lending rates',
		            		style: {
		            			color: 'black'
		            		},
		            	},
		            	labels: {
		            		x: 40,
		            		style: {
		            			color: 'black',
		            		},
		            	},
		            	tickPixelInterval: 10,
		            	top: '65%',
		            	height: '5%',
		            })
		            this.chart.yAxis[1].update({
		            	top: '70%',
		            	height: '30%',
		            })

		        }

	    		this.chart.addSeries({
	    			name: 'Lending APY',
	    			data: lendingrates,
	    			yAxis: lendingAxis,
	    		})


		        this.chart.redraw();
		        this.chart.hideLoading();

		        this.loading = false;
			},
		}
	}
</script>