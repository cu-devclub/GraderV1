import { useState } from 'react';

function PinInput(props) {
    const [P0, setP0] = useState("");
    const [P1, setP1] = useState("");
    const [P2, setP2] = useState("");
    const [P3, setP3] = useState("");
    const [P4, setP4] = useState("");
    const [P5, setP5] = useState("");

    const pinValues = [P0, P1, P2, P3, P4, P5];
    const setPinFns = [setP0, setP1, setP2, setP3, setP4, setP5];

    const handleChange = (i, value) => {
        setPinFns[i](value);
        const newPinValues = [...pinValues];
        newPinValues[i] = value;
        if (props.onChangePin) {
            props.onChangePin(newPinValues.join(""));
        }
        if (value && i < 5) {
            document.getElementById(`pinField${i + 1}`).focus();
        }
    };

    const handleKeyDown = (i, e) => {
        if ((e.key === "Backspace" || e.key === "Delete")) {
            if (pinValues[i] === "") {
                if (i > 0) {
                    setPinFns[i - 1]("");
                    document.getElementById(`pinField${i - 1}`).focus();
                    e.preventDefault();
                }
            } else {
                setPinFns[i]("");
                e.preventDefault();
            }
        }
    };

    return (
        <div className="d-flex justify-content-start" style={{ gap: "8px", width: "fit-content" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                    key={i}
                    maxLength={1}
                    id={`pinField${i}`}
                    className="form-control text-center"
                    style={{ width: "2.5em", minWidth: 0, padding: "0.375rem 0.5em" }}
                    type="text"
                    disabled={props.disabled}
                    value={pinValues[i]}
                    onChange={(e) => handleChange(i, e.target.value.replace(/[^0-9a-zA-Z]/, ""))}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                />
            ))}
        </div>
    );
}

export default PinInput;