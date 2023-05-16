import "./AbstractBackground.css";

export const AbstractBackground = ({
  className = "main-abstract-background",
  children,
  removeRightTopAbstractForm = false,
  removeRightBottomAbstractForm = false,
  removeLeftBottomAbstractForm = false,
  removeLeftTopAbstractForm = false,
  styleAbstractBackground,
  onClick = () => {},
  onTouchMove = () => {},
}) => {
  return (
    <div
      className={className}
      style={styleAbstractBackground}
      onClick={onClick}
      onTouchMove={onTouchMove}
    >
      {removeLeftTopAbstractForm ? null : (
        <div className="left-top-abstract-form-background">
          <svg
            width="116"
            height="110"
            viewBox="0 0 116 110"
            fill="none"
            xmlns="http:www.w3.org/2000/svg"
          >
            <g id="Group 182">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.9362 -11.6456C49.7256 -11.7905 68.4288 -22.4902 83.2657 -12.6235C99.7391 -1.66858 109.65 30.4144 106.377 49.9945C103.284 68.4971 67.1224 63.3934 62.2156 78.5788C62.2156 110.721 49.2069 110.509 31.9362 109.828C14.663 109.147 8.77999 86.6395 -1.86331 72.9474C-10.3846 61.9851 -20.452 52.619 -23.1421 38.9724C-26.5576 21.6457 -31.5367 0.12513 -18.5677 -11.7936C-5.65154 -23.6638 14.436 -11.503 31.9362 -11.6456Z"
                fill="#F7B4DA"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M31.0605 -37.0057C51.0003 -37.168 71.9643 -49.1462 88.5947 -38.1005C107.059 -25.8365 118.169 10.0802 114.5 32C111.033 52.7136 75.3501 43.4242 60 57.6957C45.7857 70.9112 50.4189 99.7461 31.0605 98.9834C11.6993 98.2206 5.10511 73.0239 -6.82477 57.6957C-16.3762 45.4234 -27.6605 34.9381 -30.6757 19.6609C-34.5041 0.26371 -40.0851 -23.8285 -25.5484 -37.1715C-11.0709 -50.4601 11.4448 -36.8461 31.0605 -37.0057Z"
                stroke="black"
              />
            </g>
          </svg>
        </div>
      )}

      {removeRightTopAbstractForm ? null : (
        <div className="right-top-abstract-form-background">
          <svg
            width="175"
            height="240"
            viewBox="0 0 175 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Group 184">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M59.4488 -1.20617C82.1007 -22.8734 112.981 -29.413 142.265 -30.8204C170.814 -32.1925 203.164 -30.9163 218.252 -8.83809C232.494 12.0029 229.097 51.3421 226.994 78.3518C224.931 104.862 223.211 123.026 206.232 145.577C188.13 169.622 154.746 184.168 127.835 179.126C103.18 174.508 95.569 124.595 77.9929 108.1C63 90 59.4488 114 35.9999 78.3514C25.5 48.5 36.3355 20.9025 59.4488 -1.20617Z"
                fill="#92CDC8"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M116.532 -48.8241C150.016 -53.6718 180.545 -31.3673 205.295 -8.38905C224.572 9.50777 229.828 35.5987 235.184 61.3324C240.103 84.9599 241.65 107.977 234.307 130.986C224.308 162.313 217.892 202.469 186.729 213.155C155.228 223.957 123.085 199.046 97.4081 177.928C76.1939 160.48 95.8816 138.604 86.0001 113C74.1043 82.1765 23.7248 47.3412 35.0155 16.263C47.3423 -17.667 80.7446 -43.6431 116.532 -48.8241Z"
                stroke="black"
              />
            </g>
          </svg>
        </div>
      )}

      {removeLeftBottomAbstractForm ? null : (
        <div
          className="left-bottom-abstract-form-background"
          style={{ display: removeLeftBottomAbstractForm ? "none" : "block" }}
        >
          <svg
            width="289"
            height="397"
            viewBox="0 0 289 397"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "relative", right: "55px" }}
            className="svg-left-bottom-abstract-form-background"
          >
            <g id="Group 183">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M83.9997 224.796C52.5654 173.947 101.027 71.0974 42.6043 58.4284C-16.9536 45.5133 -68.1715 101.545 -109.973 145.891C-150.246 188.616 -179.259 239.919 -183.661 298.468C-188.441 362.048 -178.573 429.512 -134.783 475.855C-90.056 523.188 -21.4982 549.402 42.6043 537.921C78.5 508.296 70.5782 512.694 101.5 462.796C124.496 425.689 184.5 279.296 145.604 246.296C109.5 224.796 104.094 257.301 83.9997 224.796Z"
                fill="#92B1D8"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M52.8959 163.347C21.4616 112.498 60.423 52.7781 1.99998 40.1091C-57.5579 27.194 -108.776 83.2255 -150.577 127.572C-190.851 170.297 -219.863 221.6 -224.265 280.149C-229.046 343.729 -219.177 411.193 -175.387 457.536C-130.66 504.869 -62.1025 531.083 1.99998 519.602C59.7824 509.253 74.0784 455.397 105 405.5C127.996 368.392 130.448 326.874 125.498 283.5C121.165 245.531 72.9903 195.852 52.8959 163.347Z"
                stroke="black"
              />
            </g>
          </svg>
        </div>
      )}

      {removeRightBottomAbstractForm ? null : (
        <div className="right-bottom-abstract-form-background">
          <svg
            width="135"
            height="168"
            viewBox="0 0 135 168"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "relative", bottom: "-4px" }}
          >
            <g id="Group 189">
              <path
                id="Vector"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M100.236 13.5C79.827 15.59 60.0989 39.6377 45 53.5004C28.7653 68.4059 7.37993 58.0302 2.5 79.5004C-3.44404 105.652 4.67368 152.177 23.8652 170.945C42.9846 189.644 73.469 182.861 100.236 182.547C126.497 182.239 155.289 186.683 174.832 169.174C194.992 151.11 201.364 121.587 198.252 94.7273C195.436 70.414 178.125 51.4824 159.373 35.7092C142.514 21.5289 122.169 11.254 100.236 13.5Z"
                fill="#F49E4D"
              />
              <path
                id="Vector_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M111.364 1.00017C140.848 0.905624 151.078 40.3509 167.432 64.8122C179.151 82.3421 188.936 99.792 191.398 120.716C194.288 145.269 201.072 175.29 182.337 191.482C163.749 207.548 135.948 188.985 111.364 189.886C84.799 190.86 57.3037 211.264 34.9717 196.886C10.9678 181.431 -0.488057 148.863 3.9322 120.716C8.00726 94.767 38.0913 84.7441 55.6565 65.1706C75.3246 43.2537 81.8687 1.09475 111.364 1.00017Z"
                stroke="black"
              />
            </g>
          </svg>
        </div>
      )}

      {children}
    </div>
  );
};
