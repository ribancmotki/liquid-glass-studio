import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import './LevaVectorNew.scss';
import { createPlugin, useInputContext, type LevaInputProps, Components } from 'leva/plugin';
import clsx from 'clsx';

const { Row, Label, Number: NumberComp, Portal } = Components;

type VectorNewSettings = {
  xLabel?: string;
  yLabel?: string;
  xMax?: number;
  yMax?: number;
  step?: number;
  precision?: number;
  joystickSize?: number;
  confine?: 'circle';
  showVectorLine?: boolean;
};

type VectorNewValueType = {
  x: number;
  y: number;
};

type VectorNewProps = VectorNewValueType & VectorNewSettings;

type VectorNewLevaProps = LevaInputProps<
  VectorNewValueType,
  VectorNewSettings,
  VectorNewValueType
>;

type JoyStickProps = {
  showVectorLine?: boolean;
  size?: number;
  value: VectorNewValueType;
  onUpdate: (value: VectorNewValueType) => void;
  settings: Required<VectorNewSettings>;
};

function Joystick({
  showVectorLine = true,
  size = 130,
  onUpdate,
  value,
  settings,
}: JoyStickProps) {
  const [showPop, setShowPop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const [rootCenter, setRootCenter] = useState({
    x: 0,
    y: 0,
  });
  const stateRef = useRef<{
    dpr: number;
    size: number;
    showVectorLine: boolean;
    settings: Required<VectorNewSettings>;
    value: VectorNewValueType;
    updateCanvas: () => void;
  }>({
    dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio,
    updateCanvas: () => undefined,
    value,
    size,
    showVectorLine,
    settings,
  });

  stateRef.current.size = size;
  stateRef.current.showVectorLine = showVectorLine;
  stateRef.current.settings = settings;
  stateRef.current.value = value;

  useLayoutEffect(() => {
    if (!showPop) {
      return undefined;
    }

    stateRef.current.dpr = window.devicePixelRatio || 1;

    stateRef.current.updateCanvas = () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      const currentState = stateRef.current;
      const computedStyle = getComputedStyle(canvas);
      const dpr = currentState.dpr;
      const logicalSize = currentState.size;
      const sizeHiDPI = logicalSize * dpr;
      const logicalPadding = 30;
      const paddingHiDPI = logicalPadding * dpr;
      const canvasSizeHiDPI = sizeHiDPI + paddingHiDPI * 2;
      const accentColor =
        computedStyle.getPropertyValue('--leva-colors-accent2').trim() || '#007bff';
      const highlightColor =
        computedStyle.getPropertyValue('--leva-colors-highlight2').trim() || '#8c92a4';
      const xMax = Math.abs(currentState.settings.xMax);
      const yMax = Math.abs(currentState.settings.yMax);

      canvas.width = canvasSizeHiDPI;
      canvas.height = canvasSizeHiDPI;
      canvas.style.width = `${logicalSize + logicalPadding * 2}px`;
      canvas.style.height = `${logicalSize + logicalPadding * 2}px`;
      canvas.style.transform = `translate(${-logicalPadding}px, ${-logicalPadding}px)`;

      context.clearRect(0, 0, canvasSizeHiDPI, canvasSizeHiDPI);
      context.save();
      context.translate(paddingHiDPI, paddingHiDPI);

      context.save();
      context.strokeStyle = highlightColor;
      context.lineWidth = dpr;
      context.setLineDash([4 * dpr, 4 * dpr]);
      context.beginPath();
      context.arc(sizeHiDPI / 2, sizeHiDPI / 2, sizeHiDPI / 8, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      context.beginPath();
      context.arc(sizeHiDPI / 2, sizeHiDPI / 2, sizeHiDPI / 4, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([4 * dpr, 4 * dpr]);
      context.beginPath();
      context.arc(sizeHiDPI / 2, sizeHiDPI / 2, (sizeHiDPI * 3) / 8, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      const valuePoint = {
        x: (currentState.value.x / (2 * xMax)) * sizeHiDPI + sizeHiDPI / 2,
        y: (currentState.value.y / (-2 * yMax)) * sizeHiDPI + sizeHiDPI / 2,
      };

      if (currentState.showVectorLine) {
        context.save();
        context.strokeStyle = accentColor;
        context.lineWidth = 2 * dpr;
        context.beginPath();
        context.moveTo(sizeHiDPI / 2, sizeHiDPI / 2);
        context.lineTo(valuePoint.x, valuePoint.y);
        context.stroke();
        context.restore();
      }

      context.save();
      context.beginPath();
      context.fillStyle = accentColor;
      context.arc(valuePoint.x, valuePoint.y, 6 * dpr, 0, Math.PI * 2);
      context.closePath();
      context.fill();
      context.restore();

      context.save();
      context.beginPath();
      context.fillStyle = accentColor;
      context.arc(sizeHiDPI / 2, sizeHiDPI / 2, 3 * dpr, 0, Math.PI * 2);
      context.closePath();
      context.fill();
      context.restore();

      context.restore();
    };

    stateRef.current.updateCanvas();

    return () => {
      stateRef.current.updateCanvas = () => undefined;
    };
  }, [showPop]);

  useLayoutEffect(() => {
    if (showPop) {
      stateRef.current.updateCanvas();
    }
  }, [showPop, value, size, showVectorLine, settings]);

  useLayoutEffect(() => {
    return () => {
      pointerCleanupRef.current?.();
      pointerCleanupRef.current = null;
    };
  }, []);

  return (
    <div
      className={clsx('leva-vector-new__joystick')}
      onPointerDown={(event) => {
        const root = rootRef.current;

        if (!root) {
          return;
        }

        pointerCleanupRef.current?.();

        const pointerId = event.pointerId;
        const rootRect = root.getBoundingClientRect();
        const nextRootCenter = {
          x: rootRect.left + rootRect.width / 2,
          y: rootRect.top + rootRect.height / 2,
        };

        setRootCenter(nextRootCenter);
        setShowPop(true);
        event.preventDefault();

        const updateFromPointer = (pointerEvent: PointerEvent) => {
          if (pointerEvent.pointerId !== pointerId) {
            return;
          }

          pointerEvent.preventDefault();

          const delta = {
            x: pointerEvent.clientX - nextRootCenter.x,
            y: pointerEvent.clientY - nextRootCenter.y,
          };
          const currentSettings = stateRef.current.settings;
          const currentSize = stateRef.current.size;
          const nextValue = {
            x: currentSettings.xMax * (delta.x / currentSize) * 2,
            y: currentSettings.yMax * (delta.y / currentSize) * -2,
          };

          stateRef.current.value = nextValue;
          stateRef.current.updateCanvas();
          onUpdate(nextValue);
        };

        const cleanup = () => {
          document.body.removeEventListener('pointermove', handlePointerMove);
          document.body.removeEventListener('pointerup', handlePointerEnd);
          document.body.removeEventListener('pointercancel', handlePointerEnd);

          if (pointerCleanupRef.current === cleanup) {
            pointerCleanupRef.current = null;
          }
        };

        const handlePointerMove = (pointerEvent: PointerEvent) => {
          updateFromPointer(pointerEvent);
        };

        const handlePointerEnd = (pointerEvent: PointerEvent) => {
          if (pointerEvent.pointerId !== pointerId) {
            return;
          }

          updateFromPointer(pointerEvent);
          setShowPop(false);
          cleanup();
        };

        pointerCleanupRef.current = cleanup;
        document.body.addEventListener('pointermove', handlePointerMove);
        document.body.addEventListener('pointerup', handlePointerEnd);
        document.body.addEventListener('pointercancel', handlePointerEnd);
      }}
      ref={rootRef}
    >
      {showPop && (
        <Portal>
          <div
            className="leva-vector-new__joystick-pop"
            style={
              {
                '--root-center-x': `${rootCenter.x}px`,
                '--root-center-y': `${rootCenter.y}px`,
                '--joystick-size': `${size}px`,
              } as CSSProperties
            }
          >
            <div className="leva-vector-new__joystick-pop-bg"></div>
            <canvas width={1} height={1} ref={canvasRef}></canvas>
            <div className="leva-vector-new__joystick-pop-value">
              {`${settings.xLabel}: ${value.x}, ${settings.yLabel}: ${value.y}`}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function LevaVectorNewComponent() {
  const props = useInputContext<VectorNewLevaProps>();
  const { label, displayValue, onUpdate, onChange, settings, value } = props;
  const settingsRequired = settings as Required<VectorNewSettings>;
  const { step, showVectorLine, joystickSize } = settingsRequired;

  return (
    <Row input className="leva-vector-new">
      <Label>{label}</Label>
      <div className="leva-vector-new__input-wrapper">
        <Joystick
          showVectorLine={showVectorLine}
          size={joystickSize}
          value={value}
          onUpdate={onUpdate}
          settings={settingsRequired}
        ></Joystick>
        {(['x', 'y'] as const).map((key) => {
          const maximum = Math.abs(settingsRequired[`${key}Max`]);
          const coordinateLabel = settingsRequired[`${key}Label`];

          return (
            <NumberComp
              key={key}
              displayValue={displayValue[key]}
              value={displayValue[key]}
              onUpdate={(nextValue) => {
                const lastCoordinateValue = value[key];
                const currentCoordinateValue =
                  typeof nextValue === 'function'
                    ? nextValue(lastCoordinateValue)
                    : nextValue;

                onUpdate({
                  ...value,
                  [key]: currentCoordinateValue,
                });
              }}
              onChange={(nextValue) => {
                onChange({
                  ...value,
                  [key]: nextValue,
                });
              }}
              settings={{
                step,
                min: -maximum,
                max: maximum,
                pad: 0,
                initialValue: value[key],
              }}
              label={coordinateLabel}
            ></NumberComp>
          );
        })}
      </div>
    </Row>
  );
}

const normalize = ({
  x,
  y,
  xLabel,
  yLabel,
  xMax,
  yMax,
  step,
  precision,
  joystickSize,
  confine,
  showVectorLine,
}: VectorNewProps): {
  value: VectorNewValueType;
  settings: Required<VectorNewSettings>;
} => {
  const normalizedXMax = Math.abs(xMax ?? 1);
  const normalizedYMax = Math.abs(yMax ?? 1);
  const normalizedStep = Math.abs(step ?? 0.01);
  const normalizedPrecision = Math.max(0, Math.trunc(precision ?? 2));
  const normalizedJoystickSize = Math.max(1, Math.abs(joystickSize ?? 130));

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error('Vector coordinates must be finite numbers');
  }

  if (!Number.isFinite(normalizedXMax) || normalizedXMax === 0) {
    throw new Error('xMax must be a finite non-zero number');
  }

  if (!Number.isFinite(normalizedYMax) || normalizedYMax === 0) {
    throw new Error('yMax must be a finite non-zero number');
  }

  if (!Number.isFinite(normalizedStep) || normalizedStep === 0) {
    throw new Error('step must be a finite non-zero number');
  }

  if (!Number.isFinite(normalizedPrecision)) {
    throw new Error('precision must be a finite number');
  }

  if (!Number.isFinite(normalizedJoystickSize)) {
    throw new Error('joystickSize must be a finite number');
  }

  return {
    value: {
      x,
      y,
    },
    settings: {
      xMax: normalizedXMax,
      yMax: normalizedYMax,
      xLabel: xLabel ?? 'x',
      yLabel: yLabel ?? 'y',
      step: normalizedStep,
      precision: normalizedPrecision,
      showVectorLine: showVectorLine ?? true,
      joystickSize: normalizedJoystickSize,
      confine: confine ?? 'circle',
    },
  };
};

const sanitize = (
  value: VectorNewValueType,
  settings: VectorNewSettings,
  lastValue: VectorNewValueType,
): VectorNewValueType => {
  const precision = Math.max(0, Math.trunc(settings.precision ?? 2));
  const xMax = Math.abs(settings.xMax ?? 1);
  const yMax = Math.abs(settings.yMax ?? 1);
  const precisionMultiplier = Math.pow(10, precision);

  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    throw new Error('Invalid value');
  }

  if (!Number.isFinite(xMax) || xMax === 0) {
    throw new Error('xMax must be a finite non-zero number');
  }

  if (!Number.isFinite(yMax) || yMax === 0) {
    throw new Error('yMax must be a finite non-zero number');
  }

  const roundToPrecision = (coordinate: number) => {
    return Math.round(coordinate * precisionMultiplier) / precisionMultiplier;
  };

  let normalizedX = roundToPrecision(Math.max(-xMax, Math.min(xMax, value.x)));
  let normalizedY = roundToPrecision(Math.max(-yMax, Math.min(yMax, value.y)));

  if (settings.confine === 'circle') {
    const normalizedLength = Math.hypot(normalizedX / xMax, normalizedY / yMax);

    if (normalizedLength > 1) {
      const scale = 1 / normalizedLength;
      normalizedX = roundToPrecision(normalizedX * scale);
      normalizedY = roundToPrecision(normalizedY * scale);

      const roundedLength = Math.hypot(normalizedX / xMax, normalizedY / yMax);

      if (roundedLength > 1) {
        const correctionScale = 1 / roundedLength;
        normalizedX *= correctionScale;
        normalizedY *= correctionScale;
      }
    }
  }

  if (lastValue.x === normalizedX && lastValue.y === normalizedY) {
    throw new Error('Unchanged');
  }

  return {
    x: normalizedX,
    y: normalizedY,
  };
};

const format = (value: VectorNewValueType): VectorNewValueType => {
  return {
    x: value.x,
    y: value.y,
  };
};

export const LevaVectorNew = createPlugin({
  sanitize,
  format,
  normalize,
  component: LevaVectorNewComponent,
});
