import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit , signal, ChangeDetectorRef } from '@angular/core';
import { DragDropService } from '../services/drag-drop.service';
import { ViewStateService } from '../services/view-state.service';
import { Subscription } from 'rxjs';
import { Router, RouterLink,ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { SidebarService } from '../services/sidebar.service';
import { inject } from '@angular/core';
import { NotesStateService } from '../services/notes-state.service';
import { AccordionDirective } from '../directives/accordion.directive';
import { TypeBasedListComponent } from '../type-based-list/type-based-list.component';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { ChartType } from "../services/visualization-types"
import { VisualizationService } from '../services/hvisualization.service';
import * as echarts from "echarts";
import "echarts-gl";
import { forkJoin } from 'rxjs';
import { SensorDataResponse } from "../services/http-requests.service";
import { AppbarComponent } from '../appbar/appbar.component';
interface ChartCompatibility {
  [sensorType: string]: ChartType[]
}
import { HttpRequestsService, type AggregationLevel,type SensorDataParams} from "../services/http-requests.service"
@Component({
  selector: 'same-sensor-type',
  templateUrl: './same-sensor-type.component.html',
  styleUrls: ['./same-sensor-type.component.css'],
  imports: [CommonModule, FormsModule, AppbarComponent,TypeBasedListComponent, SafeHtmlPipe],
  standalone:true,
  providers: [HttpRequestsService,DragDropService],
})

export class SameSensorTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("chartContainer", { static: false }) chartContainer!: ElementRef

  // Accordion state signals for each sensor type
  temperatureOpen = signal(false);
  humidityOpen = signal(false);
  luminanceOpen = signal(false);
  microphoneOpen = signal(false);
  motionOpen = signal(false);
  observationOpen = signal(false);
  presenceOpen = signal(false);
  pressureOpen = signal(false);
  thermalampOpen = signal(false);
  thermographyOpen = signal(false);
  classroomOpen = signal(false);
  classroomHumidityOpen = signal(false);
  classroomLuminanceOpen = signal(false);
  classroomMicrophoneOpen = signal(false);
  classroomMotionOpen = signal(false);
  classroomPressureOpen = signal(false);
  classroomPresenceOpen = signal(false);
  classroomObservationOpen = signal(false);
  classroomThermalampOpen = signal(false);
  classroomThermographyOpen = signal(false);

  @ViewChild('differentTypesBtn') differentTypesBtn!: ElementRef<HTMLButtonElement>;
  private viewSubscription!: Subscription;
  private dragDropSubscription!: Subscription;
  public sensorDropped = false
  private chartInstance!: echarts.ECharts;
  currentView: 'same' | 'different' = 'same';
  showNotes = false;
  notesContent = '';
  public errorMessage: string = ""
  private notesSubscription!: Subscription;
  private routePath: string = '';
  startDate?: Date
  endDate?: Date
  public isCustomDataMode = false
  selectedGranularity = "minute"
  sidebarService = inject(SidebarService);
  public selectedMetric: string = 'average'; // Default metric is always 'average'
  public ChartType = ChartType
  public selectedChartType: string | null = null
  public timeRangeSet = false
  public isLoading = false
  private chartInitialized = false

  // Controls which UI sections are enabled
  public uiState = {
    chartsEnabled: false,
    metricsEnabled: false,
    timeControlsEnabled: false,
  }

  public showToast = false;
  public toastMessage = '';
  public toastType: 'error' | 'info' = 'error';

  // Maps sensor types to compatible chart types
  private chartCompatibility: ChartCompatibility = {
    temperature: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    humidity:[ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    luminance: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    microphone: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    motion: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    radio: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    pressure: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    presence: [ChartType.Line, ChartType.Area, ChartType.Bar, ChartType.Scatter, ChartType.Step],
    thermalmap: [ChartType.Heatmap],
    thermography: [ChartType.Heatmap],
  }

  // List of sensors currently dropped on the chart area
  public droppedSensors: {
    sensorType: string;
    agentSerial: string;
    facility: string;
    unit: string;
    location?: string;
  }[] = [];

  constructor(
    public dragDropService: DragDropService,
    private viewStateService: ViewStateService,
    private notesState: NotesStateService,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef,
    public cdr: ChangeDetectorRef,
    public visualizationService: VisualizationService,
    private httpRequestsService: HttpRequestsService,
  ) {}

  // Toggle the notes panel visibility
  toggleNotes() {
    this.showNotes = !this.showNotes;
  }

  // Update notes content as user types
  onNotesInput(event: Event): void {
    this.notesContent = (event.target as HTMLTextAreaElement).value;
  }

  // Show a toast notification if no data is returned for some sensors
  private showNoDataToast(agentSerials: string[]) {
    this.toastMessage = `No data was fetched from the following agent serials: ${agentSerials.join(', ')}`;
    this.toastType = 'error';
    this.showToast = true;
    setTimeout(() => this.showToast = false, 8000);
  }

  ngOnInit(): void {
    // Subscribe to view changes (same/different sensor type)
    this.viewSubscription = this.viewStateService.currentView$.subscribe(view => {
      this.currentView = view;
      this.handleViewChange();
    });

    this.routePath = this.router.url;
    const state = this.notesState.getNotesState(this.routePath);
    this.showNotes = state.show;
    this.notesContent = state.content;
    this.initializeDragDrop();

    // Remove sensor from droppedSensors when removed via dragDropService
    this.dragDropService.sensorRemoved.subscribe((agentSerial: string) => {
      this.droppedSensors = this.droppedSensors.filter(s => s.agentSerial !== agentSerial);
      this.sensorDropped = this.droppedSensors.length > 0;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // Initialize drag and drop for sensors and chart area
    this.dragDropService.initializeDragDrop()
    setTimeout(() => this.dragDropService.initializeSensors(), 500);
    this.dragDropService.registerDropZone('main-y-axis');
    this.dragDropService.configureDragDrop({
      allowMultipleTypes: true // Allow multiple sensors of same type
    });

    // Re-initialize sensors after accordion toggles
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
      button.addEventListener('click', () => {
        setTimeout(() => this.dragDropService.initializeSensors(), 300);
      });
    });

    // Ensure only one metric switch is checked at a time
    const metricsContainer = document.querySelector('.metrics-container');
    if (metricsContainer) {
      const switches = metricsContainer.querySelectorAll<HTMLInputElement>('.form-check-input');
      switches.forEach(switchElement => {
        switchElement.addEventListener('change', (e) => {
          if (switchElement.checked) {
            switches.forEach(otherSwitch => {
              if (otherSwitch !== switchElement) otherSwitch.checked = false;
            });
          }
        });
      });
    }

    setTimeout(() => {
      this.dragDropService.initializeSensors();
      this.dragDropService.initializeDragDrop();
    }, 0);
  }

  // Re-initialize sensors and drag-drop after sensors are rendered
  onSensorsRendered() {
    setTimeout(() => {
      this.dragDropService.initializeSensors();
      this.dragDropService.initializeDragDrop();
    }, 0);
  }

  // Set up drag and drop event handlers for sensors and custom data
  private initializeDragDrop() {
    this.dragDropService.initializeSensors = () => {
      document.querySelectorAll<HTMLElement>(".sensor-item, .custom-data-item").forEach((element) => {
        this.dragDropService["renderer"].listen(element, "mousedown", (e: MouseEvent) =>
          this.dragDropService["handleMouseDown"](e),
        )
      })
    }

    this.dragDropService.initializeDragDrop()

    // Listen for drop events and handle new sensor drops
    this.dragDropService.showMessage.subscribe((message) => {
      if (message === "drop-success") {
        const metadata = this.dragDropService.getDroppedMetadata()
        if (metadata) {
          try {
            const parsedMetadata = JSON.parse(metadata)
            this.handleSensorDrop(parsedMetadata)
          } catch (error) {
            console.error("Error parsing drop metadata:", error)
          }
        }
      }
    });
  }

  // Handle a sensor being dropped onto the chart area
  private handleSensorDrop(metadata: any) {
    console.log("Received sensor type:", metadata.sensorType)
    console.log("Handling sensor drop with metadata:", metadata)

    if (!metadata) {
      console.error("Invalid sensor metadata: null or undefined")
      return
    }

    const sensorType = metadata.sensorType || "Unknown"
    const agentSerial = metadata.agentSerial || "Unknown"
    if (!metadata?.sensorType || !metadata?.agentSerial) {
      console.error('Invalid sensor metadata:', metadata);
      return;
    }

    const newSensor = {
      sensorType: metadata.sensorType,
      agentSerial: metadata.agentSerial,
      facility: metadata.site,
      unit: metadata.unit,
      location: metadata.location
    };

    // Prevent duplicate sensors
    if (!this.droppedSensors.some(s => s.agentSerial === newSensor.agentSerial)) {
      this.droppedSensors.push(newSensor);
    }

    this.sensorDropped = this.droppedSensors.length > 0;

    // Enable chart and metric UI sections
    this.enableCompatibleCharts(newSensor.sensorType);
    this.uiState.metricsEnabled = true
    this.uiState.timeControlsEnabled = true

    // Update UI
    this.cdr.detectChanges()

    console.log("Sensor drop processed. UI state:", this.uiState)
    console.log("sensorDropped flag:", this.sensorDropped)
  }

  // Reset all parameters to initial state
  private initializeParameters() {
    this.selectedMetric = 'average';
    this.selectedChartType = null
    this.sensorDropped = false
    this.timeRangeSet = false
    this.visualizationService.currentGranularity = 'minute'
    this.uiState = {
      chartsEnabled: false,
      metricsEnabled: false,
      timeControlsEnabled: false,
    }
  }

  // Check if a chart type is compatible with the current sensor type
  isChartCompatible(chartType: ChartType): boolean {
    if (!this.uiState.chartsEnabled) {
      return false;
    }
    const sensorType = this.droppedSensors.length > 0 ? this.droppedSensors[0].sensorType : "";
    if (!sensorType) {
      return false;
    }
    return this.chartCompatibility[sensorType]?.includes(chartType) || false;
  }

  // Enable chart icons compatible with the given sensor type
  private enableCompatibleCharts(sensorType: string) {
    console.log("Enabling compatible charts for sensor type:", sensorType)
    this.uiState.chartsEnabled = true

    setTimeout(() => {
      const compatibleCharts = this.chartCompatibility[sensorType] || []
      const chartIcons = document.querySelectorAll(".chart-icon");
      chartIcons.forEach((icon: Element) => {
        const chartType = icon.getAttribute("data-chart-type") as ChartType;
        const isCompatible = compatibleCharts.includes(chartType as ChartType.Line | ChartType.Scatter | ChartType.Area | ChartType.Bar | ChartType.Step | ChartType.Heatmap);
        icon.classList.toggle("chart-compatible", isCompatible);
        icon.classList.toggle("chart-disabled", !isCompatible);
      });
    }, 0);
  }

  // Handle metric selection; always fallback to 'average' if unchecked
  updateMetric(metric: string, isChecked: boolean) {
    if (!this.uiState.metricsEnabled) {
      return;
    }

    if (isChecked) {
      this.selectedMetric = metric;
      this.visualizationService.applyMetric(metric);
    } else {
      this.selectedMetric = 'average';
      this.visualizationService.applyMetric('average');
    }
  }

  // Handle start date input change
  onStartDateChange(value: string) {
    const localDate = new Date(value);
    this.startDate = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate()
    ));
  }

  // Handle end date input change
  onEndDateChange(value: string) {
    const localDate = new Date(value);
    const utcEnd = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      23, 59, 59, 999
    ));
    this.endDate = new Date(utcEnd.getTime() + 1);
  }

  // Check if granularity can be increased
  canIncreaseGranularity(): boolean {
    return (
      this.uiState.timeControlsEnabled &&
      this.visualizationService.currentGranularity !== "year"
    )
  }

  // Check if granularity can be decreased
  canDecreaseGranularity(): boolean {
    return (
      this.uiState.timeControlsEnabled &&
      this.visualizationService.currentGranularity !== "minute"
    )
  }

  // Increase granularity and align dates
  increaseGranularity() {
    if (!this.startDate || !this.endDate) return;
    if (this.canIncreaseGranularity()) {
      this.visualizationService.updateGranularity("up");
      const newStart = this.visualizationService.alignDateToGranularity(this.startDate.getTime());
      const newEnd = this.visualizationService.alignDateToGranularity(this.endDate.getTime());
      this.startDate = new Date(newStart);
      this.endDate = new Date(Math.max(newEnd, this.endDate.getTime()));
      this.cdr.detectChanges();
    }
  }

  // Decrease granularity and update selectedGranularity
  decreaseGranularity() {
    if (!this.startDate || !this.endDate) return;
    if (this.canDecreaseGranularity()) {
      this.visualizationService.updateGranularity("down");
      const newGranularity = this.mapGranularity(this.visualizationService.currentGranularity);
      this.selectedGranularity = newGranularity;
      this.cdr.detectChanges();
    }
  }

  // Apply changes: initialize chart and update data
  async applyChanges() {
    if (this.isLoading) return; 
    this.isLoading = true;
    console.log("wating for changes to apply")
    try {
      await this.initializeChart();
      await this.updateChartData();
    } catch (error) {
      console.error('Apply error:', error);
    } finally {
      this.isLoading = false;
    }

    if (!this.startDate || !this.endDate) return;
    const commonParams = {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
      granularity: this.visualizationService.currentGranularity
    };
    try {
      await this.initializeChart();
      this.updateChartData();
    } catch (error) {
      console.error('Error applying changes:', error);
    }
  }

  // Initialize the chart instance
  private async initializeChart(): Promise<boolean> {
    if (!this.chartContainer?.nativeElement) return false;
    const dom = this.chartContainer.nativeElement;

    if (dom.offsetWidth === 0 || dom.offsetHeight === 0) {
      console.warn('Chart container has no width or height');
      return false;
    }
    const existingInstance = echarts.getInstanceByDom(dom);
    if (existingInstance) {
      existingInstance.dispose();
    }
    this.chartInstance = echarts.init(dom);
    this.visualizationService.initChart(dom);
    this.cdr.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.chartInitialized = true;
    return true;
  }

  // Fetch and update chart data for all dropped sensors
  private async updateChartData() {
    if (!this.canApply()) return;
    this.isLoading = true;

    try {
      const requests = this.droppedSensors.map(sensor => {
        const params: SensorDataParams = {
          facility: sensor.facility,
          sensor_type: sensor.sensorType,
          agent_serial: [sensor.agentSerial],
          aggregation_level: this.mapGranularity(this.visualizationService.currentGranularity),
          metric: this.selectedMetric!,
          start: this.formatDateNoMillis(this.startDate),
          end: this.formatDateNoMillis(this.endDate),
        };
        return this.httpRequestsService.fetchSensorData(params);
      });

      // Wait for all requests to complete
      const results = await forkJoin(requests).toPromise();
      const emptySerials: string[] = [];
      const validResults: SensorDataResponse[] = [];

      (results as (SensorDataResponse | null)[]).forEach((r, idx) => {
        const allValues = r && r.aggregated_results
          ? Object.values(r.aggregated_results).flat()
          : [];
        if (!r || allValues.length === 0) {
          emptySerials.push(this.droppedSensors[idx].agentSerial);
        } else {
          validResults.push(r);
        }
      });

      if (emptySerials.length > 0 && validResults.length > 0 || validResults.length === 0) {
        this.showNoDataToast(emptySerials);
      }
      const metaByAgentSerial: Record<string, { facility: string; location: string; sensorType: string }> = {};
      this.droppedSensors.forEach(sensor => {
        metaByAgentSerial[sensor.agentSerial] = {
          facility: sensor.facility,
          location: sensor.location ?? '',
          sensorType: sensor.sensorType
        };
      });

      // Build chart series for each sensor
      const series = validResults.map((rawData, idx) => {
        const processed = this.visualizationService.processAggregatedData(rawData, this.startDate!, this.endDate!);
        const sensor = this.droppedSensors[idx];
        return {
          name: sensor.agentSerial,
          data: processed.values
        };
      }).filter(s => s.data.length > 0);

      if (!this.chartInitialized) {
        await this.initializeChart();
      }

      // Update chart with all series
      this.visualizationService.updateMultiSeriesChart({
        series,
        chartType: this.selectedChartType as 'line' | 'bar' | 'scatter' | 'area' | 'step'
      }, this.chartInstance, metaByAgentSerial);

    } catch (error) {
      console.error("Chart update failed:", error);
      this.errorMessage = error instanceof Error
        ? error.message
        : "Failed to load data. Please check your parameters";
    } finally {
      this.isLoading = false;
    }
  }

  // Check if all required conditions are met to apply changes
  canApply(): boolean {
    if(this.selectedGranularity=='minute'){
      return !!this.visualizationService.currentGranularity && this.sensorDropped && !!this.selectedChartType && !!this.startDate && !!this.endDate;
    }
    else
      return !!this.visualizationService.currentGranularity && this.sensorDropped && !!this.selectedMetric && !!this.selectedChartType && !!this.startDate && !!this.endDate;
  }

  // Color palette for chart series
  readonly sensorPalette = [
    '#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE',
    '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'
  ];

  // Get color for a series by index
  getSeriesColor(index: number): string {
    return this.sensorPalette[index % this.sensorPalette.length];
  }

  // Format date as ISO string without milliseconds
  private formatDateNoMillis(date?: Date): string {
    if (!date) return '';
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  // Handle chart type selection and update UI
  selectChartType(type: ChartType) {
    this.selectedChartType = type
    this.visualizationService.setChartType(type as 'line' | 'bar' | 'scatter' | 'area' | 'step');
    const chartIcons = document.querySelectorAll(".chart-icon");
    chartIcons.forEach(icon => {
      const iconType = icon.getAttribute("data-chart-type") as ChartType;
      icon.classList.toggle("chart-selected", iconType === type);
    });
  }

  // Map granularity string to backend aggregation level
  private mapGranularity(granularity: string): AggregationLevel {
    const mapping: Record<string, AggregationLevel> = {
      minute: "minute",
      hour: "hourly",
      day: "daily",
      month: "monthly",
      year: "yearly",
    }
    return mapping[granularity] || "minute"
  }

  // Check if all required conditions are met for visualization
  public allConditionsMet(): boolean {
    const conditions = {
      sensorDropped: this.sensorDropped,
      selectedMetric: !!this.selectedMetric,
      selectedChartType: !!this.selectedChartType,
      timeRange: !!this.startDate && !!this.endDate,
    }
    return conditions.sensorDropped && conditions.selectedMetric && conditions.selectedChartType && conditions.timeRange
  }

  // Animate height transitions for UI elements
  private animateHeight(start: number, end: number) {
    const element = this.el.nativeElement;
    element.style.height = `${start}px`;
    element.offsetHeight; // Trigger reflow
    requestAnimationFrame(() => {
      element.style.height = `${end}px`;
      element.addEventListener('transitionend', () => {
        element.style.height = '';
      }, { once: true });
    });
  }

  // Toggle accordion open/close state for sensor type sections
  toggleAccordion(section: string) {
    const stateMap = {
      'temperature': this.temperatureOpen,
      'humidity': this.humidityOpen,
      'luminance': this.luminanceOpen,
      'microphone': this.microphoneOpen,
      'motion': this.motionOpen,
      'observation': this.observationOpen,
      'presence': this.presenceOpen,
      'pressure': this.pressureOpen,
      'thermalamp': this.thermalampOpen,
      'thermography': this.thermographyOpen,
      'classroom': this.classroomOpen,
      'classroomHumidity': this.classroomHumidityOpen,
      'classroomLuminance': this.classroomLuminanceOpen,
      'classroomMicrophone': this.classroomMicrophoneOpen,
      'classroomMotion': this.classroomMotionOpen,
      'classroomPressure': this.classroomPressureOpen,
      'classroomPresence': this.classroomPresenceOpen,
      'classroomObservation': this.classroomObservationOpen,
      'classroomThermalamp': this.classroomThermalampOpen,
      'classroomThermography': this.classroomThermographyOpen
    } as const;

    type ValidSection = keyof typeof stateMap;

    if (section in stateMap) {
      const validSection = section as ValidSection;
      stateMap[validSection].update(v => !v);
      if (validSection.startsWith('classroom')) {
        const sensorType = validSection.replace('classroom', '').toLowerCase();
        if (sensorType && sensorType in stateMap) {
          const parentSection = sensorType as ValidSection;
          stateMap[parentSection].set(true);
        }
      }
    }
  }

  // Configure drag and drop for multiple sensor types
  private configureDragDrop(): void {
    this.dragDropService.configureDragDrop({
      allowMultipleTypes: true 
    });
  }

  // Handle view switching between same and different sensor types
  private handleViewChange(): void {
    this.configureDragDrop();
    this.dragDropService.clearDropZone();
  }

  // Switch between same and different sensor type views
  switchView(viewType: 'same' | 'different'): void {
    if(viewType === 'different') {
      this.router.navigate(['/data-comparison/different-types']);
    }
    this.viewStateService.switchView(viewType);
  }

  ngOnDestroy(): void {
    this.notesState.setNotesState(this.routePath, this.showNotes, this.notesContent);
    if (this.viewSubscription) {
      this.viewSubscription.unsubscribe();
    }
    if (this.dragDropSubscription) {
      this.dragDropSubscription.unsubscribe();
    }
    if (this.notesSubscription) {
      this.notesSubscription.unsubscribe();
    }
  }

  // Clear notes content and update state
  clearNotes(): void {
    this.notesContent = '';
    this.notesState.setNotesState(this.routePath, this.showNotes, '');
  }
}